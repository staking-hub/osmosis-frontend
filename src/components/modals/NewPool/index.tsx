import React, { Dispatch, FunctionComponent, SetStateAction } from 'react';
import cloneDeep from 'lodash-es/cloneDeep';
import { NewPoolStage1 } from './Step1';
import { sumArray } from '../../../utils/Big';
import map from 'lodash-es/map';
import { NewPoolStage2 } from './Step2';
import { NewPoolStage3 } from './Step3';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';
import { TModal } from '../../../interfaces';
import { Img } from '../../common/Img';

const defaultState = {
	pools: [
		{
			token: 'akt',
			ratio: '50',
			channel: 'Channel-1',
			amount: '100.323122',
		},
		{
			token: 'atom',
			ratio: '50',
			channel: 'Channel-1',
			amount: '100.123123',
		},
	],
	stage: 1,
} as IPoolState;
export const NewPoolModal: FunctionComponent = () => {
	const [state, setState] = React.useState<IPoolState>(cloneDeep(defaultState));
	const content = React.useMemo(() => {
		if (state.stage === 1) return <NewPoolStage1 poolState={state} setPoolState={setState} />;
		else if (state.stage === 2) return <NewPoolStage2 poolState={state} setPoolState={setState} />;
		else if (state.stage === 3) return <NewPoolStage3 poolState={state} setPoolState={setState} />;
	}, [state]);
	return (
		<div style={{ width: '656px' }} className="bg-surface rounded-2xl pt-8 pb-7.5 px-7.5 text-white-high">
			<div>{content}</div>
			<NewPoolButton state={state} setPoolState={setState} />
		</div>
	);
};

const NewPoolButton: FunctionComponent<INewPoolButton> = observer(({ state, setPoolState }) => {
	const { layoutStore } = useStore();

	const validateFunc = React.useCallback(() => {
		if (state.stage === 1) {
			// check ratio & sum of ratio === 100
			let ratioError;
			const res = sumArray(
				map(state.pools, v => {
					if (Number(v.ratio) <= 0) {
						ratioError = true;
					}
					return v.ratio;
				}),
				10
			);
			if (ratioError) {
				return 'All pool ratios must be non-zero positive values';
			}
			if (Number(res) !== 100) {
				// TODO : replace all alerts with toast messages
				return 'Ratio doesn’t march, total amount should be 100%';
			}

			// check tokens are all different
			const tokenArr = map(state.pools, v => v.token);
			if (tokenArr.length !== [...new Set(tokenArr)]?.length) {
				return 'There should be no coiniciding tokens';
			}
		} else if (state.stage === 2) {
			for (const pool of state.pools) {
				// TODO : @Thunnini fetch user's balance for this token
				const balance = 342.124532;
				if (Number(pool.amount) > balance) {
					return 'Insufficient available balance';
				} else if (pool.amount === '') {
					return 'Please input a valid amount';
				} else if (Number(pool.amount) <= 0) {
					return 'Amount cannot be 0';
				}
			}
		}
		return false;
	}, [state.pools, state.stage]);

	const onNextClick = React.useCallback(() => {
		// data validation process
		if (validateFunc()) return;

		if (state.stage === 3) {
			alert('Generated Pools!');
			layoutStore.updateCurrentModal(TModal.INIT);
			return;
		}

		setPoolState(prevState => ({ ...prevState, stage: prevState.stage + 1 }));
	}, [layoutStore, setPoolState, state, validateFunc]);

	const validateRes = validateFunc();
	return (
		<>
			{typeof validateRes === 'string' && (
				<div className="mt-6 mb-7.5 w-full flex justify-center items-center">
					<div className="py-1.5 px-3.5 rounded-lg bg-missionError flex justify-center items-center">
						<Img className="h-5 w-5 mr-2.5" src="/public/assets/Icons/Info-Circle.svg" />
						<p>{validateRes}</p>
					</div>
				</div>
			)}
			<button
				onClick={onNextClick}
				className="mt-7.5 w-2/3 h-15 rounded-2xl bg-primary-200 flex items-center justify-center mx-auto hover:opacity-75">
				<h6>{state.stage < 3 ? 'Next' : 'Create Pool'}</h6>
			</button>
		</>
	);
});

interface INewPoolButton {
	state: IPoolState;
	setPoolState: Dispatch<SetStateAction<IPoolState>>;
}

export interface IPoolState {
	pools: TPool[];
	stage: number;
}
export interface TPool {
	token: string;
	ratio: string;
	channel: string;
	amount: string;
}
