"use client";

import React, { useEffect, useState } from "react";
import Toggle from "./_component/toggle";
import axios from "axios";
import { serverApiUrl } from "@/constant/config";
const History = () => {
  const [isTrade, setIsTrade] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [data, setData] = useState([]);

  useEffect(() => {
    try {
      setIsLoading(true);
      if (isTrade) {
        axios.get(`${serverApiUrl}/tradeHistory`).then((res) => {
          setData(res.data);
        });
      } else {
        axios.get(`${serverApiUrl}/transactions`).then((res) => {
          setData(res.data);
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [isTrade]);

  return (
    <div className="p-8">
      <Toggle isTrade={isTrade} setIsTrade={setIsTrade} />

      {isLoading ? (
        <div>Loading......</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isTrade ? (
            <div className="text-center text-lg">Trade History Content</div>
          ) : (
            <div className="text-center text-lg">
              Transaction History Content
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;
