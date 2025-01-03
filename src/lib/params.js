function fetchParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    radius: params.get("radius"),
    wkt: params.get("wkt"),
    dateMin: params.get("dateMin"),
    dateMax: params.get("dateMax"),
  };
}

export { fetchParams };
