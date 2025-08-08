"use client";

import React, { useState } from "react";
import Toggle from "./_component/toggle";
const History = () => {
  const [isTrade, setIsTrade] = useState<boolean>(true);
  return (
    <div className="p-8">
      <Toggle isTrade={isTrade} setIsTrade={setIsTrade} />

      {/* Content based on selection */}
      <div>
        {isTrade ? (
          <div className="text-center text-lg">Trade History Content</div>
        ) : (
          <div className="text-center text-lg">Transaction History Content</div>
        )}
      </div>
    </div>
  );
};

export default History;
