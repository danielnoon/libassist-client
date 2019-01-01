interface Listener {
  item: string;
  callback: (value: any) => void;
  id: number;
}

export class State {
  [key: string]: any;
  static _listeners: Listener[] = [];
  static id = 0;

  public static Set(item: string, value: any) {
    this[item] = value;
    this._listeners.filter(listener => listener.item === item).forEach(listener => listener.callback(value));
  }

  public static Get(item: string) {
    return this[item];
  }

  public static Listen(item: string, callback: (value: any) => void) {
    this._listeners.push({ item, callback, id: this.id });
    return this.id++;
  }

  public static UnListen(id: number) {
    const l = this._listeners.filter(listener => listener.id === id);
    if (l[0]) delete l[0];
  }
}