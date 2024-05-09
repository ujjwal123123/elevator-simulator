"use client";

import Image from "next/image";
import styles from "./page.module.scss";
import { Dispatch, MouseEventHandler, SetStateAction, useState } from "react";
import assert from "assert";

const floorCount = 10;

const enum ElevatorDirection {
  None,
  Up,
  Down,
  Both,
}

function ElevatorButton({
  buttonDirection: buttonDirection,
  buttonsStates: buttonsStates,
  setActiveState: setActiveState,
  setFloorToVisit: setFloorToVisit,
  floor,
}: {
  buttonDirection: ElevatorDirection;
  buttonsStates: ElevatorDirection;
  setActiveState: Dispatch<SetStateAction<ElevatorDirection>>;
  setFloorToVisit: Dispatch<SetStateAction<ElevatorDirection[]>>;
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
    setFloorToVisit((prevState) => {
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
  floor,
  currentFloor,
  elevatorDirection,
  setFloorsToVisit: setFloorToVisit,
}: {
  floor: number;
  currentFloor: number;
  elevatorDirection: ElevatorDirection;
  setFloorsToVisit: Dispatch<SetStateAction<ElevatorDirection[]>>;
}) {
  const [activeDirButton, setActiveDirButton] = useState<ElevatorDirection>(
    ElevatorDirection.None
  );

  if (floor === currentFloor && elevatorDirection & activeDirButton) {
    setActiveDirButton((prevState) => prevState & ~elevatorDirection);
  }

  return (
    <div className={styles.button_panel}>
      {floor !== floorCount - 1 && (
        <ElevatorButton
          buttonDirection={ElevatorDirection.Up}
          buttonsStates={activeDirButton}
          setActiveState={setActiveDirButton}
          setFloorToVisit={setFloorToVisit}
          floor={floor}
        />
      )}
      {floor !== 0 && (
        <ElevatorButton
          buttonsStates={activeDirButton}
          buttonDirection={ElevatorDirection.Down}
          setActiveState={setActiveDirButton}
          setFloorToVisit={setFloorToVisit}
          floor={floor}
        />
      )}
      <span className={styles.current_floor_indicator}>
        {currentFloor}
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

function Elevator({
  floor,
  currentFloor,
  elevatorDirection: elevatorDirection,
  setFloorsToVisit: setFloorsToVisit,
  floorsToVisit,
}: {
  floor: number;
  currentFloor: number;
  elevatorDirection: ElevatorDirection;
  setFloorsToVisit: Dispatch<SetStateAction<ElevatorDirection[]>>;
  floorsToVisit: ElevatorDirection[];
}) {
  return (
    <div className={styles.elevator_container}>
      {currentFloor == floor &&
      floorsToVisit[currentFloor] & elevatorDirection ? (
        <ElevatorOpen />
      ) : (
        <ElevatorClosed />
      )}
      <ButtonPanel
        floor={floor}
        currentFloor={currentFloor}
        elevatorDirection={elevatorDirection}
        setFloorsToVisit={setFloorsToVisit}
      />
      <span>Floor {floor}</span>
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

  const elevators = [];

  for (let i = floorCount - 1; i >= 0; i--) {
    elevators.push(
      <Elevator
        floor={i}
        currentFloor={elevatorCurrentFloor}
        elevatorDirection={elevatorDirection}
        setFloorsToVisit={setFloorsToVisit}
        floorsToVisit={floorsToVisit}
      />
    );
  }

  // Move the elevator to the next floor after 2 seconds
  setTimeout(() => {
    if (elevatorDirection === ElevatorDirection.Up) {
      if (elevatorCurrentFloor < floorCount - 1) {
        setElevatorCurrentFloor(elevatorCurrentFloor + 1);
      } else {
        setElevatorDirection(ElevatorDirection.Down);
      }
    } else if (elevatorDirection === ElevatorDirection.Down) {
      if (elevatorCurrentFloor > 0) {
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
  }, 2000);

  return elevators;
}

export default function Home() {
  return (
    <main className={styles.main}>
      <ElevatorShaft />
    </main>
  );
}
