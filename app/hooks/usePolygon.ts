import { useState, useCallback } from 'react';

export interface Point {
  x: number;
  y: number;
}

export const usePolygon = (initialPoints: Point[]) => {
  const [points, setPoints] = useState<Point[]>(initialPoints);

  const moveVertex = useCallback((index: number, newPos: Point) => {
    setPoints((current) => {
      const next = [...current];
      if (index >= 0 && index < next.length) {
        next[index] = newPos;
      }
      return next;
    });
  }, []);

  const addVertex = useCallback((edgeIndex: number, newPoint: Point) => {
    setPoints((current) => {
      const next = [...current];
      // Insert after the start point of the edge
      // If edge is from index i to i+1, we insert at i+1
      const insertIndex = edgeIndex + 1;
      next.splice(insertIndex, 0, newPoint);
      return next;
    });
  }, []);

  const removeVertex = useCallback((index: number) => {
    setPoints((current) => {
      if (current.length <= 3) return current; // Minimum 3 points for a polygon
      const next = [...current];
      next.splice(index, 1);
      return next;
    });
  }, []);

  return {
    points,
    setPoints,
    moveVertex,
    addVertex,
    removeVertex,
  };
};
