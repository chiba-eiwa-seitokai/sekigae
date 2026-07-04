export type SeatPos = { row: number; col: number };

export type CellType = "seat" | "gap" | "podium" | "door" | "window";

export type Classroom = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  layout: CellType[][];
};

export type DirectionPref = "front" | "rear" | "left" | "right" | "none";

export type StudentPrefs = {
  direction: DirectionPref;
  distantStudentIds: string[];
  pairStudentId?: string;
};

export type Student = {
  studentId: string;
  name?: string;
  furigana?: string;
  /** Teacher-assigned fixed seat. Takes precedence over the algorithm and is never moved. */
  fixedSeat?: SeatPos;
  /** Teacher-excluded from automatic assignment (seat left empty). */
  excluded?: boolean;
  prefs: StudentPrefs;
};

export type Assignment = Map<string, SeatPos>;

export type AssignSeatsOptions = {
  /** Seed for the shuffle RNG, for reproducible test runs. */
  seed?: number;
  /** Maximum swap passes in the post-adjustment step. */
  maxAdjustPasses?: number;
};

export type AssignSeatsResult = {
  assignment: Assignment;
  /** studentIds that could not be seated because there weren't enough seats. */
  unseated: string[];
};
