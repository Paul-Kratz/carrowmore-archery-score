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
import { IShootDenormalized, ShootParticipantInput } from "@/models";
import { ShootDenormalized } from "@/models/mongoose";
import { User } from "@/models/mongoose";
import { Types } from "mongoose";

type ParticipantInsert = {
  _id: Types.ObjectId;
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
  participants,
  defaultPegColor,
  allowedPegColors,
}: {
  userId: string;
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
  clubId,
  participants,
}: {
  userId: string;
  clubId: string;
  participants?: ShootParticipantInput[];
}) => {
  await connectMongoose();

  const clubData = CLUBS[clubId];

  if (!clubData) {
    throw new Error("Invalid clubId");
  }

  const allowedPegColors = getClubPegColors(clubData);
  const defaultPegColor = allowedPegColors[0];
  const { registeredParticipants, guestParticipants } =
    normalizeParticipantInputs({
      userId,
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
  const users = await User.find(
    { _id: { $in: uniqueParticipants.map((id) => new Types.ObjectId(id)) } },
    { _id: 1, name: 1, email: 1 },
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
        user._id.toString() === userId,
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

  const rounds = Array.from(
    { length: clubData.totalStations },
    (_, index) => index + 1,
  );
  const joinedAt = new Date();
  const participantDocs: ParticipantInsert[] = [
    ...uniqueParticipants.map((uid) => ({
      _id: new Types.ObjectId(),
      user: new Types.ObjectId(uid),
      pegColor: registeredPegColorsByUserId.get(uid) ?? defaultPegColor,
      joinedAt,
    })),
    ...guestParticipants.map((participant) => ({
      _id: new Types.ObjectId(),
      guestName: participant.guestName,
      guestNameNormalized: normalizeParticipantName(participant.guestName),
      pegColor: participant.pegColor,
      joinedAt,
    })),
  ];

  const shootDoc = await ShootDenormalized.create({
    schemaVersion: 1,
    createdBy: new Types.ObjectId(userId),
    clubId,
    totalStations: clubData.totalStations,
    completed: false,
    completedAt: null,
    notes: null,
    firstScoredAt: null,
    participantCount: participantDocs.length,
    scoredCount: 0,
    totalScoreSlots: participantDocs.length * clubData.totalStations,
    participants: participantDocs.map((participantDoc) => ({
      _id: participantDoc._id,
      user: participantDoc.user ?? null,
      guestName: participantDoc.guestName ?? null,
      guestNameNormalized: participantDoc.guestNameNormalized ?? null,
      pegColor: participantDoc.pegColor,
      joinedAt: participantDoc.joinedAt,
      scores: rounds.map((roundNumber) => ({
        _id: new Types.ObjectId(),
        roundNumber,
        score: null,
        scoredAt: null,
      })),
      totalScore: 0,
      scoredCount: 0,
    })),
  });

  return formatResponse<IShootDenormalized & { id: string }>(shootDoc);
};
