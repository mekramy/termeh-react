import type { HTMLAttributes, PropsWithChildren } from "react";
import { classNames } from "../../utils";
import { CloseIcon } from "../internal/CloseIcon";
import { BaseModal } from "./BaseModal";

type SimpleProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {
    title?: string;
    primary?: string;
    secondary?: string;
};

export function Simple({
    title,
    primary,
    secondary,
    children,
    className,
}: SimpleProps) {
    const hasActions = !!primary || !!secondary;

    return (
        <BaseModal
            className={classNames("is-simple", className)}
            header={
                title
                    ? ({ isClosable, isModal, close }) => (
                          <>
                              <h1>{title}</h1>
                              {isClosable && isModal && (
                                  <div
                                      className="icon is-close"
                                      onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          close();
                                      }}
                                  >
                                      <CloseIcon />
                                  </div>
                              )}
                          </>
                      )
                    : undefined
            }
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
