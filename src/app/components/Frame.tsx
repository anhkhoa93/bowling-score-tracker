"use client";

export default function Frame({ frame }: { frame: number[] }) {
  return (
    <div>
      <div>{frame[0]}</div>
      <div>{frame[1]}</div>
    </div>
  );
}