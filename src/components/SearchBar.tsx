import {
  geocodeLocation,
  reverseGeocodeLocation,
} from "./Weather/geocodingAPI";
import { ReactComponent as SearchIcon } from "../assets/icons/search.svg";
import { ReactComponent as GoBackIcon } from "../assets/icons/arrow.svg";
import { ReactComponent as LocationIcon } from "../assets/icons/location-outline.svg";
import { useEffect, useRef, useState } from "react";
import _ from "lodash";
import uuid from "react-uuid";

import noInternetAccessEmptyState from "../assets/no-internet-access.jpg";

function Location({ location, assignLocation }) {
  return (
    <li
      className="search-box-location-element"
      onClick={() => {
        assignLocation(location);
      }}
    >
      <span className="search-box-location-element-icon">
        <LocationIcon />
      </span>
      <span className="search-box-location-element-text">
        {location.cityName},{" "}
        {location.stateName ? location.stateName + ", " : null}
        {location.countryName}
      </span>
    </li>
  );
}

function SearchBox({ geocodedLocation, assignLocation }) {
  const searchBox = useRef(null);
  const searchBoxDropdownVisibility =
    geocodedLocation.length >= 1 ? "true" : "false";
  let previusSearchBoxHeight;
  if (searchBoxDropdownVisibility === "false" && searchBox.current)
    searchBox.current.style.setProperty(
      "--previousHeight",
      `${searchBox.current.offsetHeight}px`
    );

  return (
    <div
      className="search-box"
      data-visible={searchBoxDropdownVisibility}
      ref={searchBox}
    >
      <ul>
        {Array.isArray(geocodedLocation) ? (
          geocodedLocation.map((location) => {
            return (
              <Location
                key={uuid()}
                location={location}
                assignLocation={assignLocation}
              />
            );
          })
        ) : geocodedLocation?.message === "No internet access" ? (
          <div className="search-box-empty-state">
            <img src={noInternetAccessEmptyState} alt="" />
          </div>
        ) : null}
      </ul>
    </div>
  );
}

export function SearchBar({ currentLocation, setLocation }) {
  const [geocodedLocation, setGeocodedLocation] = useState([]);
  const [searchBoxVisibility, setSearchBoxVisibility] = useState("false");

  const desktopResolution = window.matchMedia("(min-width: 769px)");

  useEffect(() => {
    if (searchBoxVisibility === "false" && geocodedLocation.length >= 1) {
      setSearchBoxVisibility("true");
    } else if (desktopResolution.matches && geocodedLocation.length === 0) {
      setSearchBoxVisibility("false");
    }
  }, [geocodedLocation]);

  useEffect(() => {
    if (desktopResolution.matches && searchBoxVisibility === "true") {
      window.addEventListener("scroll", disableSearchBoxVisibility, {
        once: true,
      });
    } else {
      window.removeEventListener("scroll", disableSearchBoxVisibility);
    }
  }, [searchBoxVisibility]);

  function assignLocation(location) {
    if (_.isEqual(currentLocation, location) === false) {
      setLocation(location);
    }
    disableSearchBoxVisibility();
  }

  async function getGeocodedLocation(event) {
    const geocodedLocation = await geocodeLocation(event.target.value);
    setGeocodedLocation(geocodedLocation);
  }

  function disableSearchBoxVisibility() {
    setSearchBoxVisibility("false");
  }

  function enableSearchBoxVisibilityInDesktop() {
    if (desktopResolution.matches === false || geocodedLocation.length >= 1) {
      setSearchBoxVisibility("true");
    }
  }

  return (
    <div className="weather-search">
      <input
        id="weather-search-input"
        type="search"
        placeholder="Search location"
        autoComplete="off"
        onInput={_.debounce(getGeocodedLocation, 250)}
        onFocus={enableSearchBoxVisibilityInDesktop}
        onClick={enableSearchBoxVisibilityInDesktop}
        onKeyDown={(event) => {
          if (event.key === "Enter") disableSearchBoxVisibility();
        }}
      />
      <button className="weather-search-button">
        <span className="search-box-location-element-icon">
          {searchBoxVisibility === "false" ? (
            <label htmlFor="weather-search-input">
              <SearchIcon />
            </label>
          ) : (
            <GoBackIcon
              style={{
                fill: "#0068E1",
              }}
              onClick={() => setSearchBoxVisibility("false")}
            />
          )}
        </span>
      </button>

      <div className="search-box-container" data-visible={searchBoxVisibility}>
        <SearchBox
          geocodedLocation={geocodedLocation}
          assignLocation={assignLocation}
        />
        <div
          className="search-box-overlay"
          onClick={() => {
            if (desktopResolution.matches) disableSearchBoxVisibility();
          }}
        ></div>
      </div>
    </div>
  );
}
