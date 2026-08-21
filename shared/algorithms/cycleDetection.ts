/**
 * A minimal singly-linked list node compatible with Floyd's tortoise-and-hare
 * cycle-detection algorithm. Nodes are compared by object identity, not value.
 */
export type LinkedListNode<T> = {
  value: T;
  next: LinkedListNode<T> | null;
};

/**
 * Returns the first node at which Floyd's tortoise and hare pointers meet, or
 * null when the list terminates. Runs in O(n) time and O(1) auxiliary space.
 */
function findLinkedListMeetingNode<T>(
  head: LinkedListNode<T> | null
): LinkedListNode<T> | null {
  let tortoise = head;
  let hare = head;

  while (hare?.next) {
    tortoise = tortoise?.next ?? null;
    hare = hare.next.next;

    if (tortoise !== null && tortoise === hare) return tortoise;
  }

  return null;
}

/**
 * Detects whether a singly-linked list contains a cycle using Floyd's
 * tortoise-and-hare algorithm. Runs in O(n) time and O(1) auxiliary space.
 */
export function hasLinkedListCycle<T>(head: LinkedListNode<T> | null): boolean {
  return findLinkedListMeetingNode(head) !== null;
}

/**
 * Returns the node where a linked-list cycle begins, or null for an acyclic
 * list. After the tortoise and hare meet, one pointer restarts at the head;
 * moving both one step at a time locates the cycle entry in O(n) time.
 */
export function findLinkedListCycleEntry<T>(
  head: LinkedListNode<T> | null
): LinkedListNode<T> | null {
  const meetingNode = findLinkedListMeetingNode(head);
  if (meetingNode === null) return null;

  let entryCandidate = head;
  let cycleCandidate: LinkedListNode<T> | null = meetingNode;

  while (entryCandidate !== cycleCandidate) {
    if (entryCandidate === null || cycleCandidate === null) return null;
    entryCandidate = entryCandidate.next;
    cycleCandidate = cycleCandidate.next;
  }

  return entryCandidate;
}

/**
 * An adjacency-list representation of a directed graph. Vertices that occur
 * only as neighbours are valid and are treated as vertices with no outgoing
 * edges unless they also appear as a map key.
 */
export type DirectedGraph<T> = ReadonlyMap<T, readonly T[]>;

/**
 * Finds one directed cycle through depth-first search. A back edge to a
 * vertex currently being visited proves a cycle exists. The returned path
 * repeats its first vertex at the end, for example ["mix", "render", "mix"].
 *
 * The algorithm runs in O(V + E) time and O(V) auxiliary space.
 */
export function findDirectedGraphCycle<T>(graph: DirectedGraph<T>): T[] | null {
  const UNVISITED = 0;
  const VISITING = 1;
  const VISITED = 2;
  const state = new Map<T, number>();
  const traversalPath: T[] = [];
  const vertices = new Set<T>();

  graph.forEach((neighbours, vertex) => {
    vertices.add(vertex);
    neighbours.forEach(neighbour => vertices.add(neighbour));
  });

  const visit = (vertex: T): T[] | null => {
    state.set(vertex, VISITING);
    traversalPath.push(vertex);

    for (const neighbour of graph.get(vertex) ?? []) {
      const neighbourState = state.get(neighbour) ?? UNVISITED;

      if (neighbourState === VISITING) {
        const cycleStart = traversalPath.findIndex(
          pathVertex => pathVertex === neighbour
        );
        return cycleStart === -1
          ? [neighbour, neighbour]
          : [...traversalPath.slice(cycleStart), neighbour];
      }

      if (neighbourState === UNVISITED) {
        const cycle = visit(neighbour);
        if (cycle !== null) return cycle;
      }
    }

    traversalPath.pop();
    state.set(vertex, VISITED);
    return null;
  };

  let detectedCycle: T[] | null = null;
  vertices.forEach(vertex => {
    if (
      detectedCycle !== null ||
      (state.get(vertex) ?? UNVISITED) !== UNVISITED
    )
      return;
    detectedCycle = visit(vertex);
  });

  return detectedCycle;
}

/**
 * Detects whether a directed graph contains a cycle using depth-first search.
 */
export function hasDirectedGraphCycle<T>(graph: DirectedGraph<T>): boolean {
  return findDirectedGraphCycle(graph) !== null;
}
