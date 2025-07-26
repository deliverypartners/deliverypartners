import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface RateCardProps {
  vehicle: string;
  image: string;
  weight: string;
  size?: string;
  price: string;

}

export function RateCard({ vehicle, image, weight, size, price }: RateCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 w-full md:w-[350px] text-center border border-gray-200 m-2">
      <div className="mb-4">
        <img src={image} alt={vehicle} style={{ height: 120, margin: "0 auto" }} />
      </div>
      {size && <div className="text-sm text-gray-500 mb-1">{size}</div>}
      <Badge className="mb-2 text-base bg-blue-100 text-blue-700">{weight}</Badge>
      <div className="font-bold text-xl mb-1">{vehicle}</div>
      <div className="text-md mb-2">Starting from <b>{price}</b></div>
      
      
    </div>
  );
}
