// フィルタ名を型引数にしておくことで、呼び出し側が持つ厳密な名前の型
// (App の TaskFilterName) をキャストなしでそのまま渡せる。
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
      // visually-hidden な span を並べるだけだと、支援技術に読まれる名前で
      // 語の区切りが失われ "ShowAlltasks" のように繋がってしまう。
      aria-label={`Show ${props.name} tasks`}
      aria-pressed={props.isPressed}
      onClick={() => props.setFilter(props.name)}
    >
      {props.name}
    </button>
  );
}

export default FilterButton;
