import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { GlobalControls } from "../components/GlobalControls";

const meta: Meta<typeof GlobalControls> = {
  title: "App/GlobalControls",
  component: GlobalControls,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof GlobalControls>;

export const Default: Story = {
  render: () => (
    <div className="w-[360px] bg-[#0b0e11] p-6">
      <GlobalControls />
    </div>
  ),
};
