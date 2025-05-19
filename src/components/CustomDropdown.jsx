import React, { useState, useRef } from "react";
import {
  List,
  ListItem,
  Input,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";

const CustomDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      initialFocusRef={inputRef}
      placement="bottom-start"
    >
      <PopoverTrigger>
        <Button
          rightIcon={<ChevronDown />}
          onClick={() => setIsOpen(!isOpen)}
          width="100%"
          justifyContent="space-between"
        >
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent width="100%">
        <PopoverBody padding={0}>
          <Input
            ref={inputRef}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            borderRadius={0}
          />
          <List maxHeight="200px" overflowY="auto">
            {filteredOptions.map((option) => (
              <ListItem
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                padding={2}
                _hover={{ bg: "gray.100" }}
                cursor="pointer"
              >
                {option}
              </ListItem>
            ))}
          </List>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
export default CustomDropdown;
