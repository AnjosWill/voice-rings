import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RingControls } from "../components/RingControls";

const meta: Meta<typeof RingControls> = {
  title: "App/RingControls",
  component: RingControls,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof RingControls>;

export const Default: Story = {
  render: () => (
    <div className="w-[360px] bg-[#0b0e11] p-6">
      <RingControls />
    </div>
  ),
};
