import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { DataState } from "../DataState";

describe("DataState", () => {
  it("renders children when not loading and not errored", () => {
    render(
      <DataState loading={false} error={false} onRetry={() => {}}>
        <Text>content</Text>
      </DataState>,
    );
    expect(screen.getByText("content")).toBeTruthy();
  });

  it("shows the retry action on error and calls onRetry when pressed", () => {
    const onRetry = jest.fn();
    render(
      <DataState loading={false} error onRetry={onRetry} message="Boom">
        <Text>content</Text>
      </DataState>,
    );
    expect(screen.getByText("Boom")).toBeTruthy();
    expect(screen.queryByText("content")).toBeNull();
    fireEvent.press(screen.getByText("Retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
