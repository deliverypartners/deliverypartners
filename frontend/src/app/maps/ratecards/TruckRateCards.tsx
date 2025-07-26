import React from "react";
import { RateCard } from "./RateCards";

export function TruckRateCards() {
  return (
    <div>
      <div className="text-center font-bold text-2xl mb-2">Book Trucks in Bihar</div>
      <div className="flex justify-center flex-wrap">
        <RateCard
          vehicle="3 WHEELER"
          image="https://ik.imagekit.io/vf1wtj1uk/deliverypartners/3wheeler.jpg?updatedAt=1752335447393"
          weight="500 kg"
          size="5 ft x 6 ft"
          price="₹800"
          
         
        />
         <RateCard
          vehicle="TATA ACE"
          image="https://ik.imagekit.io/vf1wtj1uk/deliverypartners/tataace.jpg?updatedAt=1752335242220"
          weight="900 kg"
          size="6 ft x 7 ft"
          price="₹1000"
         
         
        />
           <RateCard
          vehicle="BOLERO PICKUP"
          image="https://ik.imagekit.io/vf1wtj1uk/deliverypartners/boleropickup.jpg?updatedAt=1752335242297"
          weight="1700 kg"
          size="5.6 ft x 9 ft"
          price="₹1400"
         
         
        />
        <RateCard
          vehicle="TATA 709 LPT"
          image="https://ik.imagekit.io/vf1wtj1uk/deliverypartners/tata709LPT.jpg?updatedAt=1752335604543"
          weight="6000 kg"
          size="6 ft x 14/16 ft"
          price="₹4000"
         
        />
        <RateCard
          vehicle="TATA LPT 1109"
          image="https://ik.imagekit.io/vf1wtj1uk/deliverypartners/tataLPT1109.jpg?updatedAt=1752335242377"
          weight="8000 kg"
          size="7.5 ft x 17/20 ft"
          price="₹4800"
         
        />
        
      </div>
    </div>
  );
}