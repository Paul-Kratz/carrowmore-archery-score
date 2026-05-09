import { CLUBS } from "@/constants";
import { formatResponse } from "@/helpers/formatResponse";
import {
  getRegisteredParticipantDisplayName,
  MAX_GUEST_NAME_LENGTH,
  normalizeParticipantName,
} from "@/helpers/participantDisplay";
import { connectMongoose } from "@/lib/mongoose";
import { IShoot } from "@/models";
import { User, Shoot, ShootParticipant, RoundScore } from "@/models/mongoose";
import mongoose, { Types } from "mongoose";

type ParticipantInsert = {
  _id: Types.ObjectId;
  shoot: Types.ObjectId;
  user?: Types.ObjectId;
  guestName?: string;
  guestNameNormalized?: string;
  joinedAt: Date;
};

export const createNewShoot = async ({
  userId,
  mode,
  participantIds,
  guestNames = [],
  clubId,
}: {
  userId: string;
  mode: "yellow" | "red";
  participantIds: string[];
  guestNames?: string[];
  clubId: string;
}) => {
  await connectMongoose();
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    // Participant validation
    const sanitizedGuestNames = guestNames.map((guestName) => guestName.trim());

    if (sanitizedGuestNames.some((guestName) => !guestName)) {
      throw new Error("Guest names cannot be empty");
    }

    if (
      sanitizedGuestNames.some(
        (guestName) => guestName.length > MAX_GUEST_NAME_LENGTH,
      )
    ) {
      throw new Error(
        `Guest names must be ${MAX_GUEST_NAME_LENGTH} characters or fewer`,
      );
    }

    const uniqueGuestNames = Array.from(new Set(sanitizedGuestNames));
    const normalizedGuestNames = uniqueGuestNames.map(normalizeParticipantName);

    if (
      uniqueGuestNames.length !== sanitizedGuestNames.length ||
      new Set(normalizedGuestNames).size !== normalizedGuestNames.length
    ) {
      throw new Error("Guest names must be unique");
    }

    // make unique list of participants
    const uniqueParticipants = Array.from(new Set([userId, ...participantIds]));
    // verify all participants exist
    const users = await User.find(
      { _id: { $in: uniqueParticipants.map((id) => new Types.ObjectId(id)) } },
      { _id: 1, name: 1, email: 1 },
      { session },
    );
    const userIds = users.map((user) => user._id.toString());

    if (userIds.length !== uniqueParticipants.length) {
      throw new Error("One or more participant userIds do not exist");
    }

    const normalizedRegisteredLabels = users.map((user) =>
      normalizeParticipantName(
        getRegisteredParticipantDisplayName(
          {
            id: user._id.toString(),
            name: user.name ?? null,
            email: user.email ?? null,
          },
          userId,
        ),
      ),
    );

    if (
      normalizedGuestNames.some((guestName) =>
        normalizedRegisteredLabels.includes(guestName),
      )
    ) {
      throw new Error(
        "Guest names cannot match selected registered participant names",
      );
    }

    // Rounds created with null scores, to be updated as shoot progresses
    const clubData = CLUBS[clubId];

    if (!clubData) {
      throw new Error("Invalid clubId");
    }

    const ROUNDS = Array.from(
      { length: clubData.totalStations },
      (_, i) => i + 1,
    );

    // Create shoot
    const [shootDoc] = await Shoot.create(
      [
        {
          mode,
          createdBy: new Types.ObjectId(userId),
          completed: false,
          clubId,
        },
      ],
      { session },
    );

    // Create all shoot participants
    const participantDocs: ParticipantInsert[] = [
      ...userIds.map((uid) => ({
        _id: new Types.ObjectId(),
        shoot: shootDoc._id,
        user: new Types.ObjectId(uid),
        joinedAt: new Date(),
      })),
      ...uniqueGuestNames.map((guestName) => ({
        _id: new Types.ObjectId(),
        shoot: shootDoc._id,
        guestName,
        guestNameNormalized: normalizeParticipantName(guestName),
        joinedAt: new Date(),
      })),
    ];

    await ShootParticipant.insertMany(participantDocs, { session });

    // Create all round scores
    await RoundScore.insertMany(
      participantDocs.flatMap((participantDoc) =>
        ROUNDS.map((roundNumber) => ({
          shoot: shootDoc._id,
          participant: participantDoc._id,
          roundNumber,
          score: null,
        })),
      ),
      { session },
    );

    await session.commitTransaction();

    return formatResponse<IShoot>(shootDoc);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
