"use client";

import Image from "next/image";
import styles from "./page.module.scss";
import { Dispatch, MouseEventHandler, SetStateAction, useState } from "react";
import assert from "assert";

const floor_count = 5;

const enum ButtonState {
  Idle,
  Active,
}

const enum ElevatorDirection {
  None,
  Up,
  Down,
  Both,
}

function ElevatorButton({
  button_direction,
  buttons_states,
  set_active_state,
}: {
  button_direction: ElevatorDirection;
  buttons_states: ElevatorDirection;
  set_active_state: Dispatch<SetStateAction<ElevatorDirection>>;
}) {
  assert(
    button_direction === ElevatorDirection.Up ||
      button_direction === ElevatorDirection.Down
  );

  const text = button_direction === ElevatorDirection.Up ? "⮝" : "⮟";
  const class_name =
    buttons_states & button_direction
      ? styles.elevator_button_active
      : styles.elevator_button;

  function click_handler() {
    set_active_state((prev_state) => prev_state | button_direction);
  }

  return (
    <button className={class_name} onClick={click_handler}>
      {text}
    </button>
  );
}

function ButtonPanel({
  floor,
  current_floor,
  elevator_direction,
}: {
  floor: number;
  current_floor: number;
  elevator_direction: ElevatorDirection;
}) {
  const [active_dir_button, set_active_dir_button] =
    useState<ElevatorDirection>(ElevatorDirection.None);

  if (floor === current_floor && elevator_direction & active_dir_button) {
    set_active_dir_button((prev_state) => prev_state & ~elevator_direction);
  }

  return (
    <div className={styles.button_panel}>
      {floor !== floor_count - 1 && (
        <ElevatorButton
          button_direction={ElevatorDirection.Up}
          buttons_states={active_dir_button}
          set_active_state={set_active_dir_button}
        />
      )}
      {floor !== 0 && (
        <ElevatorButton
          buttons_states={active_dir_button}
          button_direction={ElevatorDirection.Down}
          set_active_state={set_active_dir_button}
        />
      )}
      <span className={styles.current_floor_indicator}>
        {current_floor}
        {elevator_direction === ElevatorDirection.Up && " ⮝"}
        {elevator_direction === ElevatorDirection.Down && " ⮟"}
      </span>
    </div>
  );
}

function Elevator({
  floor,
  current_floor,
  elevator_direction,
}: {
  floor: number;
  current_floor: number;
  elevator_direction: ElevatorDirection;
}) {
  return (
    <div className={styles.elevator_container}>
      {current_floor == floor && (
        <Image
          src={"/open.jpg"}
          width={100}
          height={100}
          alt={"Open elevator"}
        />
      )}
      {current_floor != floor && (
        <Image
          src={"/closed.jpg"}
          width={100}
          height={100}
          alt={"Closed elevator"}
        />
      )}
      <ButtonPanel
        floor={floor}
        current_floor={current_floor}
        elevator_direction={elevator_direction}
      />
      <span>Floor {floor}</span>
    </div>
  );
}

function ElevatorShaft() {
  const [elevatorCurrentFloor, setElevatorCurrentFloor] = useState(0);
  const [elevatorDirection, setElevatorDirection] = useState(
    ElevatorDirection.Up
  );
  const [floorsToVisit, setFloorsToVisit] = useState([
    ElevatorDirection.None,
    ElevatorDirection.None,
    ElevatorDirection.None,
    ElevatorDirection.None,
    ElevatorDirection.None,
  ]);

  const elevators = [];

  for (let i = floor_count - 1; i >= 0; i--) {
    elevators.push(
      <Elevator
        floor={i}
        current_floor={elevatorCurrentFloor}
        elevator_direction={elevatorDirection}
      />
    );
  }

  // Move the elevator to the next floor after 2 seconds
  setTimeout(() => {
    if (elevatorDirection === ElevatorDirection.Up) {
      if (elevatorCurrentFloor < floor_count - 1) {
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
