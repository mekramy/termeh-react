import {
    type HTMLAttributes,
    type PropsWithChildren,
    type ReactElement,
} from "react";
import { classNames } from "../../utils";
import { BaseToast } from "./BaseToast";

type SimpleProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {
    icon?: ReactElement;
    primary?: string;
    secondary?: string;
};

export function Simple({
    icon,
    primary,
    secondary,
    children,
    className,
}: SimpleProps) {
    const hasActions = !!primary || !!secondary;

    return (
        <BaseToast
            className={classNames("is-simple", className)}
            icon={icon}
            body={() => children}
            actions={
                hasActions
                    ? ({ action }) => (
                          <>
                              {primary && (
                                  <button
                                      className="action"
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          action("primary");
                                      }}
                                  >
                                      {primary || "Confirm"}
                                  </button>
                              )}
                              {secondary && (
                                  <button
                                      className="action is-secondary"
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          action("secondary");
                                      }}
                                  >
                                      {secondary}
                                  </button>
                              )}
                          </>
                      )
                    : undefined
            }
        />
    );
}
