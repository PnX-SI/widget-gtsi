function drawConfig(featureGroup) {
  return {
    _onZoomEnd: function () {
      if (this._markers != null) {
        this._updateGuide();
      }
    },
    position: "topleft",
    draw: {
      polygon: {
        drawError: {
          color: "#e1e100", // Color the shape will turn when intersects
          message: "<strong>Oh snap!<strong> you can't draw that!", // Message that will show when intersect
        },
        shapeOptions: {},
      },
      circlemarker: false,
      circle: true, // Turns off this drawing tool
      rectangle: true,
    },
    edit: {
      featureGroup: featureGroup,
      remove: false,
    },
  };
}

export default drawConfig;
