import { CLUBS, getClubPegColors } from "@/constants";
import { formatResponse } from "@/helpers/formatResponse";
import {
  normalizePegColor,
  PARTICIPANT_IDENTITY_ERROR,
} from "@/helpers/shootParticipantInput";
import {
  getRegisteredParticipantDisplayName,
  MAX_GUEST_NAME_LENGTH,
  normalizeParticipantName,
} from "@/helpers/participantDisplay";
import { connectMongoose } from "@/lib/mongoose";
import { IShoot, ShootParticipantInput } from "@/models";
import { User, Shoot, ShootParticipant, RoundScore } from "@/models/mongoose";
import mongoose, { Types } from "mongoose";

type ParticipantInsert = {
  _id: Types.ObjectId;
  shoot: Types.ObjectId;
  user?: Types.ObjectId;
  guestName?: string;
  guestNameNormalized?: string;
  pegColor: string;
  joinedAt: Date;
};

type GuestParticipant = {
  guestName: string;
  pegColor: string;
};

const normalizeParticipantInputs = ({
  userId,
  participantIds,
  guestNames,
  participants,
  defaultPegColor,
  allowedPegColors,
}: {
  userId: string;
  participantIds: string[];
  guestNames: string[];
  participants?: ShootParticipantInput[];
  defaultPegColor: string;
  allowedPegColors: string[];
}) => {
  const registeredParticipants = new Map<string, string>();
  const guestParticipants: GuestParticipant[] = [];

  if (participants) {
    participants.forEach((participant) => {
      const hasUserId =
        typeof participant.userId === "string" &&
        participant.userId.trim().length > 0;
      const hasGuestName =
        typeof participant.guestName === "string" &&
        participant.guestName.trim().length > 0;

      if (hasUserId === hasGuestName) {
        throw new Error(PARTICIPANT_IDENTITY_ERROR);
      }

      const pegColor = normalizePegColor({
        pegColor: participant.pegColor,
        defaultPegColor,
        allowedPegColors,
      });

      if (hasUserId) {
        registeredParticipants.set(participant.userId!.trim(), pegColor);
        return;
      }

      guestParticipants.push({
        guestName: participant.guestName!.trim(),
        pegColor,
      });
    });
  } else {
    [userId, ...participantIds].forEach((registeredUserId) => {
      registeredParticipants.set(
        registeredUserId,
        normalizePegColor({
          pegColor: defaultPegColor,
          defaultPegColor,
          allowedPegColors,
        }),
      );
    });

    guestNames.forEach((guestName) => {
      guestParticipants.push({
        guestName,
        pegColor: defaultPegColor,
      });
    });
  }

  if (!registeredParticipants.has(userId)) {
    registeredParticipants.set(userId, defaultPegColor);
  }

  return {
    registeredParticipants: Array.from(
      registeredParticipants,
      ([registeredUserId, pegColor]) => ({
        userId: registeredUserId,
        pegColor,
      }),
    ),
    guestParticipants,
  };
};

export const createNewShoot = async ({
  userId,
  participantIds = [],
  guestNames = [],
  clubId,
  participants,
}: {
  userId: string;
  participantIds?: string[];
  guestNames?: string[];
  clubId: string;
  participants?: ShootParticipantInput[];
}) => {
  await connectMongoose();
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const clubData = CLUBS[clubId];

    if (!clubData) {
      throw new Error("Invalid clubId");
    }

    const allowedPegColors = getClubPegColors(clubData);
    const defaultPegColor = allowedPegColors[0];
    const { registeredParticipants, guestParticipants } =
      normalizeParticipantInputs({
        userId,
        participantIds,
        guestNames,
        participants,
        defaultPegColor,
        allowedPegColors,
      });

    const sanitizedGuestNames = guestParticipants.map(
      (participant) => participant.guestName,
    );

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

    const registeredPegColorsByUserId = new Map(
      registeredParticipants.map((participant) => [
        participant.userId,
        participant.pegColor,
      ]),
    );
    const uniqueParticipants = registeredParticipants.map(
      (participant) => participant.userId,
    );
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

    const ROUNDS = Array.from(
      { length: clubData.totalStations },
      (_, i) => i + 1,
    );
    // Create shoot
    const [shootDoc] = await Shoot.create(
      [
        {
          createdBy: new Types.ObjectId(userId),
          completed: false,
          clubId,
        },
      ],
      { session },
    );

    // Create all shoot participants
    const participantDocs: ParticipantInsert[] = [
      ...uniqueParticipants.map((uid) => ({
        _id: new Types.ObjectId(),
        shoot: shootDoc._id,
        user: new Types.ObjectId(uid),
        pegColor: registeredPegColorsByUserId.get(uid) ?? defaultPegColor,
        joinedAt: new Date(),
      })),
      ...guestParticipants.map((participant) => ({
        _id: new Types.ObjectId(),
        shoot: shootDoc._id,
        guestName: participant.guestName,
        guestNameNormalized: normalizeParticipantName(participant.guestName),
        pegColor: participant.pegColor,
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
