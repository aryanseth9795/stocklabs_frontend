"use client";

import React, { useEffect, useState } from "react";
import Toggle from "./_component/toggle";
import axios from "axios";
import { serverApiUrl } from "@/constant/config";
const History = () => {
  const [isTrade, setIsTrade] = useState<boolean>(true);

  const [data, setData] = useState([]);

  useEffect(() => {
    if (isTrade) {
      axios.get(`${serverApiUrl}/tradeHistory`).then((res) => {
        setData(res.data);
      });
    } else {
      axios.get(`${serverApiUrl}/transactions`).then((res) => {
        setData(res.data);
      });
    }
  }, [isTrade]);

  return (
    <div className="p-8">
      <Toggle isTrade={isTrade} setIsTrade={setIsTrade} />

      {/* Content based on selection */}
      <div>
        {isTrade ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center text-lg">Trade History Content</div>
          </div>
        ) : (
          <div>
            <div className="text-center text-lg">
              Transaction History Content
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
