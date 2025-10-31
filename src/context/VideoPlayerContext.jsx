import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

const VideoPlayerContext = createContext();

export const VideoPlayerProvider = ({ children }) => {
  // Shared state between MovieDetail and VideoPlayer
  const [preferredAudioType, setPreferredAudioType] = useState("subtitle");
  const [preferredServer, setPreferredServer] = useState(0);
  const [preferredEpisode, setPreferredEpisode] = useState(0);
  const [lastWatchedMovie, setLastWatchedMovie] = useState(null);
  const [movieEpisodes, setMovieEpisodes] = useState([]);

  // Update preferences when user makes selections in MovieDetail
  const updatePreferences = (audioType, serverIndex, episodeIndex, movieSlug, episodes) => {
    setPreferredAudioType(audioType);
    setPreferredServer(serverIndex);
    setPreferredEpisode(episodeIndex);
    setLastWatchedMovie(movieSlug);
    setMovieEpisodes(episodes);
  };

  // Get preferences for a specific movie
  const getPreferencesForMovie = (movieSlug) => {
    if (lastWatchedMovie === movieSlug) {
      return {
        audioType: preferredAudioType,
        serverIndex: preferredServer,
        episodeIndex: preferredEpisode,
        episodes: movieEpisodes
      };
    }
    return {
      audioType: "subtitle",
      serverIndex: 0,
      episodeIndex: 0,
      episodes: []
    };
  };

  // Reset preferences for a movie
  const resetPreferences = (movieSlug) => {
    if (lastWatchedMovie === movieSlug) {
      setPreferredAudioType("subtitle");
      setPreferredServer(0);
      setPreferredEpisode(0);
    }
  };

  const value = {
    preferredAudioType,
    setPreferredAudioType,
    preferredServer,
    setPreferredServer,
    preferredEpisode,
    setPreferredEpisode,
    lastWatchedMovie,
    setLastWatchedMovie,
    movieEpisodes,
    setMovieEpisodes,
    updatePreferences,
    getPreferencesForMovie,
    resetPreferences
  };

  return (
    <VideoPlayerContext.Provider value={value}>
      {children}
    </VideoPlayerContext.Provider>
  );
};

VideoPlayerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useVideoPlayer = () => {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    throw new Error('useVideoPlayer must be used within a VideoPlayerProvider');
  }
  return context;
};

export default VideoPlayerContext;
