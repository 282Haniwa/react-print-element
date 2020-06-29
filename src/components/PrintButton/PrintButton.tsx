import React, {
  ElementType,
  isValidElement,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { css } from 'emotion';
import clsx from 'clsx';
import { printElement, PrintOptions, PrintTarget } from 'print-element';

type TargetType = string | (() => Element | null) | undefined;

interface Props {
  className?: string;
  /**
   * PrintButtonのルートノードに使用されるコンポーネント
   */
  component?: ElementType<any>;
  printOptions?: PrintOptions;
  onClick?: (event: Event) => void;
  /**
   * targetにReact Elementが指定されている時、印刷後にアンマウントせずにコンポーネントを再利用する
   * default: false
   */
  recycle?: boolean;
  /**
   * 印刷する対象
   * セレクタの文字列かDOM ElementかReact Elementを指定可能
   * DOM ElementとReact Elementの場合はコールバックとして戻り値でElementが得られるようにして指定する
   */
  target?: TargetType;
}

const classes = {
  displayNone: css({
    display: 'none',
  }),
  onPrintDisplayNone: css({
    '@media print': {
      display: 'none',
    },
  }),
};

const isReactElement = (target: TargetType) =>
  typeof target === 'function' && isValidElement(target());

const PrintButton: React.FC<Props> = (props: Props) => {
  const {
    className: classNameProp,
    component: Component = 'button',
    printOptions = {
      debug: false,
      pageStyle: {},
    },
    onClick,
    recycle = false,
    target = '',
    ...other
  } = props;

  const [debugMode, setDebugMode] = useState(false);
  const [targetMounted, setTargetMounted] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const targetRef = useRef(null);
  const isReactElementTarget = isReactElement(target);
  const printTarget = isReactElementTarget
    ? () => targetRef.current
    : (target as PrintTarget);

  const handlePrint = useCallback(() => {
    printElement(printTarget as PrintTarget, {
      pageStyle: printOptions?.pageStyle,
      debug: printOptions?.debug,
      onBeforePrint: printOptions?.onBeforePrint,
      onAfterPrint: printOptions?.onAfterPrint,
    });
  }, [
    printOptions?.debug,
    printOptions?.onAfterPrint,
    printOptions?.onBeforePrint,
    printOptions?.pageStyle,
    printTarget,
  ]);

  const handleClick = useCallback(
    (event) => {
      if (onClick) {
        onClick(event);
      }
      if (printOptions?.debug && !debugMode) {
        setDebugMode(true);
      }
      if (!targetMounted) {
        setTargetMounted(true);
      }
      setIsPrinting(true);
    },
    [printOptions?.debug, debugMode, targetMounted, onClick],
  );

  const className = clsx(classNameProp, {
    [classes.onPrintDisplayNone]: !printOptions?.debug || debugMode,
  });

  useEffect(() => {
    if (printOptions?.debug) {
      // eslint-disable-next-line no-console
      console.warn('Print debug mode is true!');
    }
  }, [printOptions?.debug]);

  useEffect(() => {
    if (isPrinting) {
      handlePrint();
      setIsPrinting(false);
      if (!printOptions?.debug && !recycle) {
        setTargetMounted(false);
      }
    }
  }, [isPrinting, handlePrint, printOptions?.debug, recycle]);

  return (
    <>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Component className={className} onClick={handleClick} {...other} />
      {isReactElementTarget && targetMounted && (
        <div className={classes.displayNone}>
          <div ref={targetRef}>{(target as () => Element)()}</div>
        </div>
      )}
    </>
  );
};

export default PrintButton;
