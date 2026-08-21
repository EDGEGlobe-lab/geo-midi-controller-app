import { describe, expect, it } from "vitest";
import {
  findDirectedGraphCycle,
  findLinkedListCycleEntry,
  hasDirectedGraphCycle,
  hasLinkedListCycle,
  type LinkedListNode,
} from "./cycleDetection";

describe("Floyd's tortoise-and-hare linked-list cycle detection", () => {
  it("reports an empty or terminated list as acyclic", () => {
    const tail: LinkedListNode<number> = { value: 3, next: null };
    const middle: LinkedListNode<number> = { value: 2, next: tail };
    const head: LinkedListNode<number> = { value: 1, next: middle };

    expect(hasLinkedListCycle(null)).toBe(false);
    expect(hasLinkedListCycle(head)).toBe(false);
    expect(findLinkedListCycleEntry(head)).toBeNull();
  });

  it("detects a self-referential node and returns it as the cycle entry", () => {
    const node: LinkedListNode<string> = { value: "loop", next: null };
    node.next = node;

    expect(hasLinkedListCycle(node)).toBe(true);
    expect(findLinkedListCycleEntry(node)).toBe(node);
  });

  it("finds the first node in an internal multi-node cycle", () => {
    const entry: LinkedListNode<number> = { value: 2, next: null };
    const third: LinkedListNode<number> = { value: 3, next: null };
    const fourth: LinkedListNode<number> = { value: 4, next: entry };
    entry.next = third;
    third.next = fourth;
    const head: LinkedListNode<number> = { value: 1, next: entry };

    expect(hasLinkedListCycle(head)).toBe(true);
    expect(findLinkedListCycleEntry(head)).toBe(entry);
  });
});

describe("directed graph depth-first-search cycle detection", () => {
  it("accepts a directed acyclic graph", () => {
    const graph = new Map<string, readonly string[]>([
      ["input", ["mix", "metadata"]],
      ["mix", ["render"]],
      ["metadata", ["publish"]],
      ["render", ["publish"]],
      ["publish", []],
    ]);

    expect(hasDirectedGraphCycle(graph)).toBe(false);
    expect(findDirectedGraphCycle(graph)).toBeNull();
  });

  it("returns a closed path when DFS encounters a back edge", () => {
    const graph = new Map<string, readonly string[]>([
      ["input", ["mix"]],
      ["mix", ["render"]],
      ["render", ["mix"]],
    ]);

    expect(hasDirectedGraphCycle(graph)).toBe(true);
    expect(findDirectedGraphCycle(graph)).toEqual(["mix", "render", "mix"]);
  });

  it("detects a cycle that is disconnected from the first graph component", () => {
    const graph = new Map<number, readonly number[]>([
      [1, [2]],
      [2, []],
      [3, [4]],
      [4, [5]],
      [5, [3]],
    ]);

    expect(hasDirectedGraphCycle(graph)).toBe(true);
    expect(findDirectedGraphCycle(graph)).toEqual([3, 4, 5, 3]);
  });
});
