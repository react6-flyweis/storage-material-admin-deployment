import React, { useState } from "react";
import Modal from "../Modal";
import Button from "../common_component/Button";

interface CarrierFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CarrierFilterModal: React.FC<CarrierFilterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [equipment, setEquipment] = useState("Equipment 1");
  const [region, setRegion] = useState("Region 1");
  const [rating, setRating] = useState(4);

  const RadioOption = ({
    label,
    value,
    selectedValue,
    onChange,
    colorClass = "bg-[#3AB449]",
  }: any) => (
    <label className="flex items-center md:gap-3 gap-2 cursor-pointer group">
      <div className="relative md:w-6 md:h-6 w-4 h-4 rounded-full border-2 border-[#2563EB] flex items-center justify-center">
        {selectedValue === value && (
          <div className={`w-full h-full rounded-full ${colorClass}`} />
        )}
        <input
          type="radio"
          className="hidden"
          name={label}
          checked={selectedValue === value}
          onChange={() => onChange(value)}
        />
      </div>
      <span className="text-sm md:text-base font-inter font-medium text-[#0A0A0A]">
        {label}
      </span>
    </label>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Carrier Filter"
      width="max-w-xl"
    >
      <div className="space-y-3 md:space-y-4 py-2 mx-2">
        {/* Equipment type */}
        <div className="space-y-2 md:space-y-4">
          <h4 className="text-base font-inter font-medium text-[#0A0A0A]">
            Equipment type
          </h4>
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <RadioOption
              label="Equipment 1"
              value="Equipment 1"
              selectedValue={equipment}
              onChange={setEquipment}
            />
            <RadioOption
              label="Equipment 2"
              value="Equipment 2"
              selectedValue={equipment}
              onChange={setEquipment}
            />
            <RadioOption
              label="Equipment 3"
              value="Equipment 3"
              selectedValue={equipment}
              onChange={setEquipment}
            />
          </div>
        </div>

        <div className="h-[1px] bg-gray-100" />

        {/* Region */}
        <div className="space-y-4">
          <h4 className="text-base font-inter font-medium text-[#0A0A0A]">
            Region
          </h4>
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <RadioOption
              label="Region 1"
              value="Region 1"
              selectedValue={region}
              onChange={setRegion}
            />
            <RadioOption
              label="Region 2"
              value="Region 2"
              selectedValue={region}
              onChange={setRegion}
            />
            <RadioOption
              label="Region 3"
              value="Region 3"
              selectedValue={region}
              onChange={setRegion}
            />
          </div>
        </div>

        <div className="h-[1px] bg-gray-100" />

        {/* Rating */}
        <div className="space-y-4">
          <h4 className="text-base font-inter font-medium text-[#0A0A0A]">
            Rating
          </h4>
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <RadioOption
                key={num}
                label={num.toString()}
                value={num}
                selectedValue={rating}
                onChange={setRating}
              />
            ))}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-center gap-4 pt-4">
          <Button
            variant="white"
            onClick={onClose}
            size="lg"
          >
            Cancel
          </Button>
          <Button variant="gradient" onClick={onClose} size="lg">
            Apply Filter
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CarrierFilterModal;
