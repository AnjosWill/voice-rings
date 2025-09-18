import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CanvasPreview } from "../components/CanvasPreview";

const meta: Meta<typeof CanvasPreview> = {
  title: "App/CanvasPreview",
  component: CanvasPreview,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof CanvasPreview>;

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-[#0b0e11] p-6">
      <CanvasPreview />
    </div>
  ),
};
