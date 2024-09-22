import React, { useEffect } from 'react';
import { fabric } from 'fabric';

export default function AppartementCanvas({ imageUrl, onZoneCreate }) {
  useEffect(() => {
    const canvas = new fabric.Canvas('appartementCanvas');

    fabric.Image.fromURL(imageUrl, function (img) {
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });

    canvas.on('mouse:down', function (opt) {
      const pointer = canvas.getPointer(opt.e);
      const rect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        fill: 'rgba(255, 0, 0, 0.5)',
        width: 0,
        height: 0,
      });
      canvas.add(rect);
      canvas.setActiveObject(rect);

      canvas.on('mouse:move', function (opt) {
        const pointer = canvas.getPointer(opt.e);
        rect.set({
          width: pointer.x - rect.left,
          height: pointer.y - rect.top,
        });
        canvas.renderAll();
      });

      canvas.on('mouse:up', function () {
        onZoneCreate({
          position_x: rect.left,
          position_y: rect.top,
          width: rect.width,
          height: rect.height,
        });

        canvas.off('mouse:move');
      });
    });
  }, [imageUrl, onZoneCreate]);

  return <canvas id="appartementCanvas" width="800" height="600"></canvas>;
}
