import { useState, useEffect } from "react";
import { Square, Arrow } from "../types";

type Arrows = Arrow[];

export const useArrows = (

  customArrows?: Arrows,
  areArrowsAllowed: boolean = true,
  onArrowsChange?: (arrows: Arrows) => void,
  customArrowColor?: string,
  onArrowDraw?: (arrow: Arrow, isSameArrow: boolean, hasSameColor?: boolean) => void,
) => {
  // arrows passed programatically to `ChessBoard` as a react prop
  const [customArrowsSet, setCustomArrows] = useState<Arrows>([]);

  // arrows drawn with mouse by user on the board
  const [arrows, setArrows] = useState<Arrows>([]);

  // active arrow which user draws while dragging mouse
  const [newArrow, setNewArrow] = useState<Arrow>();

  // handle external `customArrows` props changes
  useEffect(() => {
    if (Array.isArray(customArrows)) {
      // so that custom arrows overwrite temporary arrows
      clearArrows();
      setCustomArrows(
        //filter out arrows which starts and ends in the same square
        customArrows?.filter((arrow) => arrow[0] !== arrow[1])
      );
    }
    else {
      clearArrows();
      setCustomArrows([]);
    }
  }, [customArrows]);

  // callback when arrows changed after user interaction
  useEffect(() => {
    onArrowsChange?.(arrows);
  }, [arrows]);

  // function clears all arrows drawed by user
  function clearArrows() {
    setArrows([]);
    setNewArrow(undefined);
  }

  const drawNewArrow = (fromSquare: Square, toSquare: Square) => {
    if (!areArrowsAllowed) return;

    setNewArrow([fromSquare, toSquare, customArrowColor]);
  };


  const onArrowDrawEnd = (fromSquare: Square, toSquare: Square) => {
    if (fromSquare === toSquare || !areArrowsAllowed) return;
    

    // let arrowsCopy;
    const newArrow: Arrow = [fromSquare, toSquare, customArrowColor];
    let isSameArrow: boolean = false;
    let hasSameColor: boolean = false;
    customArrowsSet.some((arrow) => {
      if (arrow[0] === fromSquare && arrow[1] === toSquare) {
        isSameArrow = true;
        hasSameColor = arrow[2] === customArrowColor;
        return true;
      }
    });

    // add the newArrow to arrows array if it is unique
    if (!isSameArrow) {
      setCustomArrows([...customArrowsSet, newArrow]);
      onArrowDraw?.(newArrow, isSameArrow, hasSameColor);
      // arrowsCopy = [...arrows, newArrow];
    }
    // remove it from the board if we already have same arrow in arrows array
    else {
      if (hasSameColor) {
        setCustomArrows(customArrowsSet.filter(([arrowFrom, arrowTo]) => {
          return !(arrowFrom === fromSquare && arrowTo === toSquare);
        }));
      }
      else {
        setCustomArrows(customArrowsSet.map((arrow) => {
          if (arrow[0] === fromSquare && arrow[1] === toSquare) {
            return [arrow[0], arrow[1], customArrowColor];
          }
          return arrow;
        }));
      }
      onArrowDraw?.(newArrow, isSameArrow, hasSameColor);
    }

    setNewArrow(undefined);
    // setArrows(arrowsCopy);
  };

  return {
    arrows:customArrowsSet,
    newArrow,
    clearArrows,
    drawNewArrow,
    setArrows,
    onArrowDrawEnd,
    setCustomArrows,
  };
};
