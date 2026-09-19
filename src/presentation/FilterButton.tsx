// フィルタ名を型引数にしておくことで、呼び出し側が持つ厳密な名前の型
// (App の FilterName) をキャストなしでそのまま渡せる。
type FilterButtonProps<TName extends string> = {
  name: TName;
  isPressed: boolean;
  setFilter: (name: TName) => void;
};

function FilterButton<TName extends string>(props: FilterButtonProps<TName>) {
  return (
    <button
      type="button"
      className="btn toggle-btn"
      aria-pressed={props.isPressed}
      onClick={() => props.setFilter(props.name)}
    >
      <span className="visually-hidden">Show </span>
      <span>{props.name}</span>
      <span className="visually-hidden"> tasks</span>
    </button>
  );
}

export default FilterButton;
