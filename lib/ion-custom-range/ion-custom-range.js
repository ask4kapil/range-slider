/**
 * Created by kapilkumawat on 19/02/16.
 */
(function() {

  var IonicCustomRange = angular.module('ionicCustomRange', ['ionic']);

  IonicCustomRange.directive('ionCustomRange', ['$window', function($window) {
    return {
      restrict: 'E',
      scope: {
        ngModel: '='
      },
      template: '<div class="static-background-line"></div>' +
      '<div class="progress-line"></div> '+
      '<div class="slider-tip">{{maxValue}}</div>'+
      '<div class="scrubber"></div>'+
      '<div class="slider-tip-min">{{minValue}}</div>'+
      '<div class="scrubber-min"></div>',
      link: function (scope, element, attrs) {
        var progressLineClass = attrs["class"] ? attrs["class"] + "-bg" : "default-progress-line-bg";
        var min = attrs["min"] ? parseFloat(attrs["min"]) : 0;
        var max = attrs["max"] ? parseFloat(attrs["max"]) : 100;
        var step = attrs["step"] ? parseFloat(attrs["step"]) : 1;
        var value = attrs["value"] ? parseFloat(attrs["value"]) : (max - Math.abs(min)) / 2;
        var minValue = attrs["minValue"] ? parseFloat(attrs["minValue"]) : Math.floor(((max - Math.abs(min)) * 1) / 3);
        var maxValue = attrs["maxValue"] ? parseFloat(attrs["maxValue"]) : Math.floor(((max - Math.abs(min)) * 2) / 3);
        var tip = attrs["tip"] ? attrs["tip"] === "true": false;
        var doubleType = attrs["type"] ? attrs["type"] === "double": false;

        var containerBox = element[0].getBoundingClientRect();
        var progressLine = element[0].querySelector('.progress-line');
        var sliderTip = element[0].querySelector('.slider-tip');
        var sliderTipMin = element[0].querySelector('.slider-tip-min');
        var scrubber = element[0].querySelector('.scrubber');
        var scrubberMin = element[0].querySelector('.scrubber-min');
        var scrubberSize = scrubber.getBoundingClientRect().width;
        var scrubbing = false;
        var offsetTouchX = Math.round(scrubberSize/2 + scrubberSize/4);
        var startX = containerBox.left + offsetTouchX;
        var offsetMarginRight = 5;
        var maxRangeInPx = containerBox.width - containerBox.left - offsetMarginRight + scrubberSize;
        var minValue, maxValue;
        // add Ionic background class to progress line
        progressLine.className += " " + progressLineClass;
        setDefaultValues();

        function setDefaultValues() {
          progressLine.style.left  = "0px";
          //Default value
          if(doubleType) {
            if (minValue < min) {
              minValue = min;
            } else if (maxValue > max) {
              maxValue = max;
            }
            scope.ngModel = scope.ngModel? scope.ngModel : {};
            maxValue = scope.ngModel.maxValue ? scope.ngModel.maxValue: maxValue;
            scope.ngModel.maxValue = maxValue;
            minValue = scope.ngModel.minValue ? scope.ngModel.minValue: minValue;
            scope.ngModel.minValue = minValue;
            scope.maxValue = maxValue;
            scope.minValue = minValue;

            setPosition(getPositionFromValue(minValue), scrubberMin);
            setPosition(getPositionFromValue(maxValue), scrubber);
          } else {
            if (value < min) {
              value = min;
            } else if (value > max) {
              value = max;
            }
            var defaultValue = scope.ngModel || value;
            setPosition(getPositionFromValue(defaultValue), scrubber);
            scope.ngModel = value;
            scope.maxValue = value;
          }
        }

        //Enble tip or not
        if(tip) {
          enableTip();
        }
        //Enable tip function
        function enableTip() {
          sliderTip.style.display = "block";
          sliderTip.className += " slider-tip-on ";
          sliderTip.className += attrs["class"]? attrs["class"]: '';//Double range
          if(doubleType) {
            sliderTipMin.style.display = "block";
            sliderTipMin.className += " slider-tip-on ";
            sliderTipMin.className += attrs["class"]? attrs["class"]: '';//Double range
          }
        }

        //Disable tip function
        function disableTip() {
          sliderTip.style.display = "none";
          sliderTip.className = "slider-tip";
          if(doubleType) {
            sliderTipMin.style.display = "none";
            sliderTipMin.className = "slider-tip-min";
          }
        }

        //Double range
        if(doubleType) {
          scrubberMin.style.display = "block";
        }

        function getPositionFromValue(value) {
          return (value - min)/(max - min) * maxRangeInPx;
        }

        function setPosition(x, target) {
          target = target || scrubber;
          target.style[ionic.CSS.TRANSFORM] = "translate3d(" + x + "px, 0, 0)";
          if(target.className === 'scrubber') {
            sliderTip.style[ionic.CSS.TRANSFORM] = "translate3d(" + x + "px, 0, 0)";
          }
          if(target.className === 'scrubber-min') {
            sliderTipMin.style[ionic.CSS.TRANSFORM] = "translate3d(" + x + "px, 0, 0)";
          }
          if(doubleType) {
            if(target.className === 'scrubber') {
              progressLine.style.width = (x - progressLine.offsetLeft) + "px";
            }
            if(target.className === 'scrubber-min') {
              progressLine.style.left = x + "px";
              progressLine.style.width = (progressLine.clientWidth - progressLine.offsetLeft) + "px";
            }
          } else {
            progressLine.style.width = x + "px";
          }
        }

        var touchStart = function(event) {
          event.preventDefault();
          scrubbing = true;
        };

        var touchMove = function(event) {
          if (scrubbing) {
            var touchX = event.touches[0].clientX;
            var delta = touchX - startX;
            var scruberEle = true;
            if(event.target.className === 'scrubber-min') {
              scruberEle = false;
            }
            if (delta < 0) {
              delta = 0;
            } else if (delta > maxRangeInPx && doubleType === false) {
              delta = maxRangeInPx;
            } else if(doubleType && scruberEle === false && delta > getPositionFromValue(maxValue)) {
              delta = getPositionFromValue(maxValue -1);
            } else if(doubleType && scruberEle && delta > maxRangeInPx) {
              delta = maxRangeInPx;
            } else if(doubleType && scruberEle && delta < getPositionFromValue(minValue)) {
              delta = getPositionFromValue(minValue + 1);
            }
            setPosition(delta, event.target);
            scope.$apply(function() {
              var value = step * Math.ceil((delta / maxRangeInPx) * (max - min) / step) + min;
              if(doubleType) {
                if(scruberEle) {
                  maxValue = Number((value).toFixed(2));
                  scope.maxValue = maxValue;
                  scope.ngModel.maxValue = maxValue;
                } else {
                  minValue = Number((value).toFixed(2));
                  scope.minValue = minValue;
                  scope.ngModel.minValue = minValue;
                  setPosition(getPositionFromValue(maxValue), scrubber);
                }
              } else {
                scope.ngModel = Number((value).toFixed(2));
                scope.maxValue = scope.ngModel;
              }
            });
          }
        };

        var touchEnd = function(event) {
          scrubbing = false;
        };

        var onResize = function(event) {
          containerBox = element[0].getBoundingClientRect();
          maxRangeInPx = containerBox.width - containerBox.left - offsetMarginRight + scrubberSize;
          if(doubleType) {
            setDefaultValues();
          } else {
            var currentValue = scope.ngModel || value;
            setPosition(getPositionFromValue(currentValue));
          }
        };

        var handleClickEvent = function (event) {
          var touchX = event.clientX;
          var delta = touchX - startX;
          if (delta < 0) {
            delta = 0;
          } else if (delta > maxRangeInPx) {
            delta = maxRangeInPx;
          }
          var scruberEle = true;
          if(doubleType && getPositionFromValue(minValue) > delta) {
            setPosition(delta, scrubberMin);
            scruberEle = false;
          } else if(doubleType && getPositionFromValue(maxValue) < delta) {
            setPosition(delta, scrubber);
          } else if(doubleType && (getPositionFromValue(maxValue) - delta) < (delta - getPositionFromValue(minValue))) {
            setPosition(delta, scrubber);
          } else if(doubleType && (getPositionFromValue(maxValue) - delta) > (delta - getPositionFromValue(minValue))) {
            setPosition(delta, scrubberMin);
            scruberEle = false;
          } else {
            setPosition(delta, scrubber);
          }
          scope.$apply(function() {
            var value = step * Math.ceil((delta / maxRangeInPx) * (max - min) / step) + min;
            if(doubleType) {
              if(scruberEle) {
                maxValue = Number((value).toFixed(2));
                scope.maxValue = maxValue;
                scope.ngModel.maxValue = maxValue;
              } else {
                minValue = Number((value).toFixed(2));
                scope.minValue = minValue;
                scope.ngModel.minValue = minValue;
                setPosition(getPositionFromValue(maxValue), scrubber);
              }
            } else {
              scope.ngModel = Number((value).toFixed(2));
              scope.maxValue = scope.ngModel;
            }
          });
        };

        //Watch function for properties
        var destroyTipWatch = scope.$watch(function() { return attrs["tip"]}, function watchNgMin() {
          if(attrs["tip"] == 'true') {
            enableTip();
          } else {
            disableTip();
          }
        });
        var destroyStepWatch = scope.$watch(function() { return attrs["step"]}, function watchNgMin() {
          step = attrs["step"] ? parseFloat(attrs["step"]) : 1;
          var delayTimer;
          (function (){
            clearTimeout(delayTimer);
            delayTimer = setTimeout(function() {
              setDefaultValues();
            }, 1000); // Will do the ajax stuff after 1000 ms, or 1 s
          })()
        });
        var destroyMinWatch = scope.$watch(function() { return attrs["min"]}, function watchNgMin() {
          min = attrs["min"] ? parseFloat(attrs["min"]) : 0;
          var delayTimer;
          (function (){
            clearTimeout(delayTimer);
            delayTimer = setTimeout(function() {
              setDefaultValues();
            }, 1000); // Will do the ajax stuff after 1000 ms, or 1 s
          })()
        });
        var destroyMaxWatch = scope.$watch(function() { return attrs["max"]}, function watchNgMin() {
          max = attrs["max"] ? parseFloat(attrs["max"]) : 100;
          var delayTimer;
          (function (){
            clearTimeout(delayTimer);
            delayTimer = setTimeout(function() {
              setDefaultValues();
            }, 1000); // Will do the ajax stuff after 1000 ms, or 1 s
          })()
        });

        ionic.on('click', handleClickEvent, element[0]);
        ionic.on('touchstart', touchStart, scrubber);
        ionic.on('touchstart', touchStart, scrubberMin);
        ionic.on('touchmove', touchMove, scrubber);
        ionic.on('touchmove', touchMove, scrubberMin);
        ionic.on('touchend', touchEnd, scrubber);
        ionic.on('touchend', touchEnd, scrubberMin);
        ionic.on('resize', onResize, $window);

        scope.$on('$destroy', function() {
          destroyTipWatch();
          destroyMaxWatch();
          destroyMinWatch();
          destroyStepWatch();
          ionic.off('click', handleClickEvent, element[0]);
          ionic.off('touchstart', touchStart, scrubber);
          ionic.off('touchstart', touchStart, scrubberMin);
          ionic.off('touchmove', touchMove, scrubber);
          ionic.off('touchmove', touchMove, scrubberMin);
          ionic.off('touchend', touchEnd, scrubber);
          ionic.off('touchend', touchEnd, scrubberMin);
          ionic.off('resize', onResize, $window);
        });
      }
    };
  }]);
})();
