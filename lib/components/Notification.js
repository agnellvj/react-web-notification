'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PERMISSION_GRANTED = 'granted';
var PERMISSION_DENIED = 'denied';

var seqGen = function seqGen() {
  var i = 0;
  return function () {
    return i++;
  };
};
var seq = seqGen();

var Notification = function (_React$Component) {
  _inherits(Notification, _React$Component);

  function Notification(props) {
    _classCallCheck(this, Notification);

    // Do not save Notification instance in state
    var _this = _possibleConstructorReturn(this, (Notification.__proto__ || Object.getPrototypeOf(Notification)).call(this, props));

    _this.notifications = {};
    _this.windowFocus = true;
    _this.onWindowFocus = _this._onWindowFocus.bind(_this);
    _this.onWindowBlur = _this._onWindowBlur.bind(_this);
    return _this;
  }

  _createClass(Notification, [{
    key: '_onWindowFocus',
    value: function _onWindowFocus() {
      this.windowFocus = true;
    }
  }, {
    key: '_onWindowBlur',
    value: function _onWindowBlur() {
      this.windowFocus = false;
    }
  }, {
    key: '_askPermission',
    value: function _askPermission() {
      var _this2 = this;

      window.Notification.requestPermission(function (permission) {
        var result = permission === PERMISSION_GRANTED;
        _this2.setState({
          granted: result
        }, function () {
          if (result) {
            _this2.props.onPermissionGranted();
          } else {
            _this2.props.onPermissionDenied();
          }
        });
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this3 = this;

      var supported = false;
      var granted = false;
      if ('Notification' in window && window.Notification) {
        supported = true;
        if (window.Notification.permission === PERMISSION_GRANTED) {
          granted = true;
        }
      }

      if (this.props.disableActiveWindow) {
        if (window.addEventListener) {
          window.addEventListener('focus', this.onWindowFocus);
          window.addEventListener('blur', this.onWindowBlur);
        } else if (window.attachEvent) {
          window.attachEvent('focus', this.onWindowFocus);
          window.attachEvent('blur', this.onWindowBlur);
        }
      }

      this.setState({
        granted: granted,
        supported: supported
      }, function () {
        if (!_this3.state.supported) {
          _this3.props.notSupported();
        } else if (_this3.state.granted) {
          _this3.props.onPermissionGranted();
        } else {
          if (window.Notification.permission === PERMISSION_DENIED) {
            if (_this3.props.askAgain) {
              _this3._askPermission();
            } else {
              _this3.props.onPermissionDenied();
            }
          } else {
            _this3._askPermission();
          }
        }
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.props.disableActiveWindow) {
        if (window.removeEventListner) {
          window.removeEventListener('focus', this.onWindowFocus);
          window.removeEventListener('blur', this.onWindowBlur);
        } else if (window.detachEvent) {
          window.detachEvent('focus', this.onWindowFocus);
          window.detachEvent('blur', this.onWindowBlur);
        }
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var doNotShowOnActiveWindow = this.props.disableActiveWindow && this.windowFocus;
      if (!this.props.ignore && this.props.title && this.state.supported && this.state.granted && !doNotShowOnActiveWindow) {
        (function () {

          var opt = _this4.props.options;
          if (typeof opt.tag !== 'string') {
            opt.tag = 'web-notification-' + seq();
          }

          if (!_this4.notifications[opt.tag]) {
            (function () {
              var n = new window.Notification(_this4.props.title, opt);
              n.onshow = function (e) {
                _this4.props.onShow(e, opt.tag);
                setTimeout(function () {
                  _this4.close(n);
                }, _this4.props.timeout);
              };
              n.onclick = function (e) {
                _this4.props.onClick(e, opt.tag);
              };
              n.onclose = function (e) {
                _this4.props.onClose(e, opt.tag);
              };
              n.onerror = function (e) {
                _this4.props.onError(e, opt.tag);
              };

              _this4.notifications[opt.tag] = n;
            })();
          }
        })();
      }

      // return null cause
      // Error: Invariant Violation: Notification.render(): A valid ReactComponent must be returned. You may have returned undefined, an array or some other invalid object.
      return _react2.default.createElement('input', { type: 'hidden', name: 'dummy-for-react-web-notification', style: { display: 'none' } });
    }
  }, {
    key: 'close',
    value: function close(n) {
      if (n && typeof n.close === 'function') {
        n.close();
      }
    }

    // for debug

  }, {
    key: '_getNotificationInstance',
    value: function _getNotificationInstance(tag) {
      return this.notifications[tag];
    }
  }]);

  return Notification;
}(_react2.default.Component);

Notification.propTypes = {
  ignore: _react2.default.PropTypes.bool,
  disableActiveWindow: _react2.default.PropTypes.bool,
  askAgain: _react2.default.PropTypes.bool,
  notSupported: _react2.default.PropTypes.func,
  onPermissionGranted: _react2.default.PropTypes.func,
  onPermissionDenied: _react2.default.PropTypes.func,
  onShow: _react2.default.PropTypes.func,
  onClick: _react2.default.PropTypes.func,
  onClose: _react2.default.PropTypes.func,
  onError: _react2.default.PropTypes.func,
  timeout: _react2.default.PropTypes.number,
  title: _react2.default.PropTypes.string.isRequired,
  options: _react2.default.PropTypes.object
};

Notification.defaultProps = {
  ignore: false,
  disableActiveWindow: false,
  askAgain: false,
  notSupported: function notSupported() {},
  onPermissionGranted: function onPermissionGranted() {},
  onPermissionDenied: function onPermissionDenied() {},
  onShow: function onShow() {},
  onClick: function onClick() {},
  onClose: function onClose() {},
  onError: function onError() {},
  timeout: 5000,
  options: {}
};

exports.default = Notification;