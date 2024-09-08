'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ChainSelector() {
  const [chain, setChain] = React.useState('sepolia');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{chain}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Chain</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={chain} onValueChange={setChain}>
          <DropdownMenuRadioItem value="sepolia">Sepolia</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="arbitrum">
            Arbitrum
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="ethereum">
            Ethereum
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
