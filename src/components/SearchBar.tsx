import React, { useContext, useEffect, useRef, useState } from "react";
import _ from "lodash";
import uuid from "react-uuid";

import { geocodeLocation } from "./Weather/geocodingAPI";

import { FetchingWeatherDataContext, OnlineStatusContext } from "../App";
import { LocationHistoryContext } from "../App";
import { preloadImages } from "../hooks/preloadImages";

import { ReactComponent as SearchIcon } from "../assets/icons/search.svg";
import { ReactComponent as GoBackIcon } from "../assets/icons/arrow.svg";
import { ReactComponent as LocationIcon } from "../assets/icons/location-outline.svg";
import noInternetAccessEmptyState from "../assets/no-internet-access.jpg";
preloadImages(noInternetAccessEmptyState);

interface SearchBarProps {
  currentLocation: LocationData;
  setLocation: React.Dispatch<React.SetStateAction<LocationData>>;
}

interface SearchBoxProps {
  geocodedLocation: LocationData[];
  assignLocation: assignLocation;
}

interface LocationProps {
  location: LocationData;
  assignLocation: assignLocation;
}

export function SearchBar({ currentLocation, setLocation }: SearchBarProps) {
  const [geocodedLocation, setGeocodedLocation] = useState<LocationData[]>([]);
  const [searchBoxVisibility, setSearchBoxVisibility] = useState("false");

  const desktopResolution = window.matchMedia("(min-width: 769px)");
  const onlineStatus = useContext(OnlineStatusContext);
  const fetchingWeatherData = useContext(FetchingWeatherDataContext);
  const locationHistory = useContext(LocationHistoryContext);

  useEffect(() => {
    if (desktopResolution.matches && searchBoxVisibility === "true") {
      window.addEventListener("scroll", disableSearchBoxVisibility, {
        once: true,
      });
    } else {
      window.removeEventListener("scroll", disableSearchBoxVisibility);
    }
  }, [searchBoxVisibility]);

  function enableSearchBoxVisibility() {
    if (
      desktopResolution.matches === false ||
      locationHistory.data.length >= 1 ||
      geocodedLocation.length >= 1
    ) {
      setSearchBoxVisibility("true");
    }
  }

  function disableSearchBoxVisibility() {
    setSearchBoxVisibility("false");
  }

  async function getGeocodedLocation(locationInput: string) {
    if (onlineStatus === false) return;
    const geocodedLocation = await geocodeLocation(locationInput);
    return geocodedLocation;
  }

  function assignLocation(location: LocationData) {
    if (_.isEqual(currentLocation, location) === false) {
      setLocation(location);
    }
    disableSearchBoxVisibility();
  }

  return (
    <div className="weather-search">
      <input
        id="weather-search-input"
        type="search"
        placeholder="Search location"
        autoComplete="off"
        onInput={_.debounce(async (event) => {
          const geocodedLocation = await getGeocodedLocation(
            (event.target as HTMLInputElement).value
          );
          if (geocodedLocation == null) return;

          setGeocodedLocation(geocodedLocation);
          if (
            locationHistory.data.length >= 1 ||
            geocodedLocation.length >= 1
          ) {
            setSearchBoxVisibility("true");
          } else if (desktopResolution.matches) {
            disableSearchBoxVisibility();
          }
        }, 500)}
        onFocus={enableSearchBoxVisibility}
        onClick={enableSearchBoxVisibility}
        onKeyDown={async (event) => {
          if (event.key === "Enter") {
            await getGeocodedLocation((event.target as HTMLInputElement).value);
            if (geocodedLocation[0]) assignLocation(geocodedLocation[0]);
            (event.target as HTMLInputElement).blur();
            disableSearchBoxVisibility();
          }
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

function SearchBox({ geocodedLocation, assignLocation }: SearchBoxProps) {
  const searchBox = useRef<HTMLDivElement>(null);
  const onlineStatus = useContext(OnlineStatusContext);
  const locationHistory = useContext(LocationHistoryContext);

  const searchBoxDropdownVisibility =
    geocodedLocation.length >= 1 ||
    locationHistory.data.length >= 1 ||
    onlineStatus === false
      ? "true"
      : "false";

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
        {onlineStatus === false ? (
          <div className="search-box-empty-state">
            <img src={noInternetAccessEmptyState} alt="" />
            <div className="search-box-empty-state-text">
              <h3>No internet connection</h3>
              <p>Please check your internet settings and try again</p>
            </div>
          </div>
        ) : geocodedLocation.length >= 1 ? (
          geocodedLocation.map((location) => {
            return (
              <Location
                key={uuid()}
                location={location}
                assignLocation={assignLocation}
              />
            );
          })
        ) : locationHistory.data.length >= 1 ? (
          locationHistory.data.map((location) => {
            return (
              <Location
                key={uuid()}
                location={location}
                assignLocation={assignLocation}
              />
            );
          })
        ) : null}
      </ul>
    </div>
  );
}

function Location({ location, assignLocation }: LocationProps) {
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
