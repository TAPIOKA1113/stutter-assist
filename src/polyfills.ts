// グローバルポリフィル
(window as any).global = window;

// Draft.jsが必要とするsetImmediate
import 'setimmediate';

// その他Draft.jsが必要とする可能性のあるポリフィル
// Object.assign
if (typeof Object.assign !== 'function') {
  Object.assign = function(target: any, ...args: any[]) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    
    const to = Object(target);
    
    for (let index = 0; index < args.length; index++) {
      const nextSource = args[index];
      
      if (nextSource != null) {
        for (const nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    
    return to;
  };
}