## 0.5.1

* Added `mathjs` dependency and ability to turn off headers dynamically

## 0.5.0

* Fixed bug with not being able to exit directly from editing cell  
* Added `ngOnDestroy` binding to clean up event listeners  
* Added ability to define cells as read-only  
  * This is done by adding in a `Cell` object instead of a `(string | number)` as an element in your `data` array and setting the `readOnly` property to `true`  
* Added code scaffolding to allow for more custom behavior to be defined in the future.   
  * Specifically, the ability to define custom templates to be transcluded via the `selector` property (NYI)

## 0.4.2

* Fixed bug with keypress event listeners

## 0.4.0

* `ngdatasheet` is compatible with targeting es5

## 0.3.0 

* Refactored edit cell code to more clearly separate responsibilities  
* Changed a bunch of types  
* Added iterator to `CoordinateMap`  
* Fixed a bug that would throw an error if a `[height]` was specified larger than `data.length`  
* Added ability to clear selected cells via delete key or public method `clearSelection`  
* Fixed a bug that didn't allow users to deselect cells when holding ctrl  
* Added showcase site  
* Refactored some `ngIfElse`s for compatibility with Angular 2.x.x  


## 0.2.0

* Removed some console messages
* Added ability to move cursor around with keyboard

## 0.0.5

* Added first iteration on cell editing

## 0.0.4

* Added ability to select-highlight cells