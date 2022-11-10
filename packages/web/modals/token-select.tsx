import Image from "next/image";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { AppCurrency, IBCCurrency } from "@keplr-wallet/types";
import { InputProps } from "../components/types";
import { SearchBox } from "../components/input";
import { t } from "react-multi-lang";
import { useStore } from "../stores";
import { ModalBase, ModalBaseProps } from "./base";

/** Intended for mobile use only - full screen alternative to token select dropdown.
 *
 *  Forward ref for search input.
 */
export const TokenSelectModal: FunctionComponent<
  ModalBaseProps & {
    tokens: {
      token: CoinPretty | AppCurrency;
      chainName: string;
    }[];
    onSelect: (coinDenom: string) => void;
  } & InputProps<string>
> = observer((props) => {
  const { priceStore } = useStore();

  return (
    <ModalBase
      className="!p-0 !rounded-xl"
      {...props}
      hideCloseButton
      title=""
      overlayClassName="md:-bottom-1/3"
    >
      <div className="p-4" onClick={(e) => e.stopPropagation()}>
        <SearchBox
          type="text"
          className="!w-full"
          placeholder={props.placeholder ?? t("components.searchTokens")}
          currentValue={props.currentValue}
          onInput={(e: any) => props.onInput(e.target.value)}
          onFocus={props.onFocus}
        />
      </div>
      <ul className="flex flex-col max-h-64 overflow-y-auto">
        {props.tokens.map((t) => {
          const currency =
            t.token instanceof CoinPretty ? t.token.currency : t.token;
          const { coinDenom, coinImageUrl } = currency;
          const networkName = t.chainName;
          const justDenom = coinDenom.split(" ").slice(0, 1).join(" ") ?? "";
          const channel =
            "paths" in currency
              ? (currency as IBCCurrency).paths[0].channelId
              : undefined;

          const showChannel = coinDenom.includes("channel");

          return (
            <li
              key={currency.coinDenom}
              className="flex justify-between items-center rounded-2xl py-2.5 px-4 my-1 hover:bg-osmoverse-900 cursor-pointer mx-3"
              onClick={(e) => {
                e.stopPropagation();
                props.onSelect(coinDenom);
                props.onRequestClose();
              }}
            >
              <button className="flex items-center justify-between text-left w-full">
                <div className="flex items-center">
                  {coinImageUrl && (
                    <div className="w-8 h-8 rounded-full mr-4">
                      <Image
                        src={coinImageUrl}
                        alt="token icon"
                        width={32}
                        height={32}
                      />
                    </div>
                  )}
                  <div>
                    <h6 className="text-white-full">{justDenom}</h6>
                    <div className="text-osmoverse-400 text-left md:caption font-semibold">
                      {showChannel ? `${networkName} ${channel}` : networkName}
                    </div>
                  </div>
                </div>
              </button>
              {t.token instanceof CoinPretty && (
                <div className="flex flex-col text-right">
                  <h6>{t.token.hideDenom(true).trim(true).toString()}</h6>
                  <span className="subtitle1 text-osmoverse-400">
                    {priceStore.calculatePrice(t.token)?.toString()}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </ModalBase>
  );
});
