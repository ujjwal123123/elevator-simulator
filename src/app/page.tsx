"use client";

import Image from "next/image";
import styles from "./page.module.scss";
import { Dispatch, MouseEventHandler, SetStateAction, useState } from "react";
import assert from "assert";

const floorCount = 6;

const enum ElevatorDirection {
  None,
  Up,
  Down,
  Both,
}

/**
 * Renders an elevator button with the specified direction and floor number.
 *
 * TODO: do not take `setActiveState`, `setFloorsToVisit` and `floor` as arguments.
 *
 * @param buttonDirection - The direction of the elevator button (Up or Down).
 * @param buttonsStates - The current state of the elevator buttons.
 * @param setActiveState - A function to set the active state of the elevator buttons.
 * @param setFloorsToVisit - A function to set the floors to visit in the elevator.
 * @param floor - The floor number associated with the button.
 * @returns The rendered elevator button component.
 */
function ElevatorButton({
  buttonDirection,
  buttonsStates,
  setActiveState,
  setFloorsToVisit,
  floor,
}: {
  buttonDirection: ElevatorDirection;
  buttonsStates: ElevatorDirection;
  setActiveState: Dispatch<SetStateAction<ElevatorDirection>>;
  setFloorsToVisit: Dispatch<SetStateAction<ElevatorDirection[]>>;
  floor: number;
}) {
  assert(
    buttonDirection === ElevatorDirection.Up ||
      buttonDirection === ElevatorDirection.Down
  );

  const text = buttonDirection === ElevatorDirection.Up ? "⮝" : "⮟";
  const className =
    buttonsStates & buttonDirection
      ? styles.elevator_button_active
      : styles.elevator_button;

  function clickHandler() {
    setActiveState((prevState) => prevState | buttonDirection);
    setFloorsToVisit((prevState) => {
      const newState = [...prevState];
      newState[floor] |= buttonDirection;
      return newState;
    });
  }

  return (
    <button className={className} onClick={clickHandler}>
      {text}
    </button>
  );
}

function ButtonPanel({
  floorLevel,
  carLevel,
  elevatorDirection,
  setFloorsToVisit,
}: {
  floorLevel: number;
  carLevel: number;
  elevatorDirection: ElevatorDirection;
  setFloorsToVisit: Dispatch<SetStateAction<ElevatorDirection[]>>;
}) {
  const [activeDirButton, setActiveDirButton] = useState<ElevatorDirection>(
    ElevatorDirection.None
  );

  if (floorLevel === carLevel && elevatorDirection & activeDirButton) {
    setActiveDirButton((prevState) => prevState & ~elevatorDirection);
  }

  return (
    <div className={styles.button_panel}>
      {floorLevel !== floorCount - 1 && (
        <ElevatorButton
          buttonDirection={ElevatorDirection.Up}
          buttonsStates={activeDirButton}
          setActiveState={setActiveDirButton}
          setFloorsToVisit={setFloorsToVisit}
          floor={floorLevel}
        />
      )}
      {floorLevel !== 0 && (
        <ElevatorButton
          buttonsStates={activeDirButton}
          buttonDirection={ElevatorDirection.Down}
          setActiveState={setActiveDirButton}
          setFloorsToVisit={setFloorsToVisit}
          floor={floorLevel}
        />
      )}
      <span className={styles.current_floor_indicator}>
        {carLevel}
        {elevatorDirection === ElevatorDirection.Up && " ⮝"}
        {elevatorDirection === ElevatorDirection.Down && " ⮟"}
      </span>
    </div>
  );
}

function ElevatorOpen() {
  return (
    <Image src={"/open.jpg"} width={100} height={100} alt={"Open elevator"} />
  );
}

function ElevatorClosed() {
  return (
    <Image
      src={"/closed.jpg"}
      width={100}
      height={100}
      alt={"Closed elevator"}
    />
  );
}

function Door({
  doorLevel,
  carLevel,
  elevatorDirection,
  setFloorsToVisit,
  floorsToVisit,
}: {
  doorLevel: number;
  carLevel: number;
  elevatorDirection: ElevatorDirection;
  setFloorsToVisit: Dispatch<SetStateAction<ElevatorDirection[]>>;
  floorsToVisit: ElevatorDirection[];
}) {
  return (
    <div className={styles.elevator_container}>
      {carLevel == doorLevel && floorsToVisit[carLevel] & elevatorDirection ? (
        <ElevatorOpen />
      ) : (
        <ElevatorClosed />
      )}
      <ButtonPanel
        floorLevel={doorLevel}
        carLevel={carLevel}
        elevatorDirection={elevatorDirection}
        setFloorsToVisit={setFloorsToVisit}
      />
      <span>Floor {doorLevel}</span>
    </div>
  );
}

function ElevatorShaft() {
  const [elevatorCurrentFloor, setElevatorCurrentFloor] = useState(0);
  const [elevatorDirection, setElevatorDirection] = useState<ElevatorDirection>(
    ElevatorDirection.Up
  );
  const [floorsToVisit, setFloorsToVisit] = useState<ElevatorDirection[]>(
    Array(floorCount).fill(ElevatorDirection.None)
  );

  const doors = [];

  for (let i = floorCount - 1; i >= 0; i--) {
    doors.push(
      <Door
        doorLevel={i}
        carLevel={elevatorCurrentFloor}
        elevatorDirection={elevatorDirection}
        setFloorsToVisit={setFloorsToVisit}
        floorsToVisit={floorsToVisit}
      />
    );
  }

  assert(doors.length === floorCount);
  assert(elevatorDirection !== ElevatorDirection.Both);

  function checkFloorsAbove() {
    for (let i = elevatorCurrentFloor + 1; i < floorCount; i++) {
      if (floorsToVisit[i]) {
        return true;
      }
    }
    return false;
  }

  function checkFloorsBelow() {
    for (let i = elevatorCurrentFloor - 1; i >= 0; i--) {
      if (floorsToVisit[i]) {
        return true;
      }
    }
    return false;
  }

  function checkFloors() {
    return checkFloorsAbove() || checkFloorsBelow();
  }

  function moveElevator() {
    if (elevatorDirection === ElevatorDirection.Up) {
      if (checkFloorsAbove()) {
        setElevatorCurrentFloor(elevatorCurrentFloor + 1);
      } else {
        setElevatorDirection(ElevatorDirection.Down);
      }
    } else if (elevatorDirection === ElevatorDirection.Down) {
      if (checkFloorsBelow()) {
        setElevatorCurrentFloor(elevatorCurrentFloor - 1);
      } else {
        setElevatorDirection(ElevatorDirection.Up);
      }
    }

    if (floorsToVisit[elevatorCurrentFloor] & elevatorDirection) {
      setFloorsToVisit((prevState) => {
        const newState = [...prevState];
        newState[elevatorCurrentFloor] &= ~elevatorDirection;
        return newState;
      });
    }
  }

  // Move the elevator to the next floor after 2 seconds
  setTimeout(() => {
    moveElevator();
  }, 2000);

  return doors;
}

export default function Home() {
  return (
    <main className={styles.main}>
      <ElevatorShaft />
    </main>
  );
}
