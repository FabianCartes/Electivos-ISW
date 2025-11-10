import PropTypes from "prop-types";

function FullScreenLoader({ message }) {
  return (
    <div className="full-screen-loader">
      <div className="full-screen-loader__spinner" />
      {message ? <p>{message}</p> : null}
    </div>
  );
}

FullScreenLoader.propTypes = {
  message: PropTypes.string,
};

FullScreenLoader.defaultProps = {
  message: "",
};

export default FullScreenLoader;


