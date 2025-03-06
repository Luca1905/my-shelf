"use client";

import { useState } from "react";
import { formatFileSize } from "~/lib/utils";

export default function Sandbox() {
  const [num, setNum] = useState("");

  return (
    <div>
      <input
        type="text"
        value={num}
        onChange={(e) => {
          setNum(e.target.value);
        }}
        className="text-black bg-white"
      />
      <p>{formatFileSize(Number(num))}</p>
    </div>
  );
}
