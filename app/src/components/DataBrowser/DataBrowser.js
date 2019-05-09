// @flow

import React, { Component, createRef } from 'react';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import { connect } from 'react-redux';
import { Skeleton } from 'antd';
import { mediaMin } from '@divyanshu013/media';
import { AutoSizer } from 'react-virtualized';

import Flex from '../Flex';
import Actions from './Actions';
import AddRowModal from './AddRowModal';
import AddFieldModal from './AddFieldModal';
import DataTableHeader from '../DataTable/DataTableHeader';
import NestedColumnToggle from './NestedColumnToggle';
import GlobalSearch from './GlobalSearch';
import ResultList from './ResultSet';
import CloneApp from './CloneApp';
import ApplyQueryBanner from './ApplyQueryBanner';

import { fetchMappings, updateReactiveList } from '../../actions';
import { getUrl, getHeaders } from '../../reducers/app';
import * as dataSelectors from '../../reducers/data';
import {
	getIsLoading,
	getMappings,
	getIndexes,
	getTypes,
} from '../../reducers/mappings';
import { parseUrl, convertArrayToHeaders, getUrlParams } from '../../utils';
import colors from '../theme/colors';

type Props = {
	url: string,
	fetchMappings: () => void,
	isLoading: boolean,
	mappings: any,
	isDataLoading: boolean,
	indexes: string[],
	types: string[],
	headers: any[],
	updateReactiveList: () => void,
};

class DataBrowser extends Component<Props> {
	headerRef = createRef();

	componentDidMount() {
		this.props.fetchMappings();
	}

	handleReload = () => {
		this.props.updateReactiveList();
	};

	render() {
		const {
			url: rawUrl,
			isLoading,
			mappings,
			isDataLoading,
			indexes,
			headers,
		} = this.props;
		const { credentials, url } = parseUrl(rawUrl);
		let baseProps = { url, app: indexes.join(',') };

		if (credentials) {
			baseProps = { ...baseProps, credentials };
		}
		const customHeaders = headers.filter(
			item => item.key.trim() && item.value.trim(),
		);

		if (customHeaders.length) {
			baseProps = {
				...baseProps,
				headers: convertArrayToHeaders(headers),
			};
		}

		const { appswitcher } = getUrlParams(window.location.search);
		const hideAppSwitcher = appswitcher && appswitcher === 'false';

		return (
			<Skeleton loading={isLoading} active>
				{!isLoading &&
					!isDataLoading &&
					mappings && (
						<div css={{ position: 'relative' }}>
							<ReactiveBase {...baseProps}>
								<div>
									<Actions onReload={this.handleReload} />
									<NestedColumnToggle />
									<GlobalSearch />
								</div>
								<ApplyQueryBanner />
								<div
									id="result-list"
									css={{
										marginTop: 15,
										border: `1px solid ${
											colors.tableBorderColor
										}`,
										borderRadius: 3,
										width: '100%',
										height:
											window.innerHeight -
											(hideAppSwitcher ? 250 : 350),
										overflow: 'visible',
									}}
								>
									<AutoSizer
										css={{
											height: '100% !important',
											width: '100% !important',
										}}
									>
										{({ height, width }) => (
											<>
												<DataTableHeader
													ref={this.headerRef}
												/>
												<ResultList
													height={height}
													width={width}
													headerRef={this.headerRef}
												/>
											</>
										)}
									</AutoSizer>
								</div>
							</ReactiveBase>
						</div>
					)}
				{mappings && (
					<Flex
						css={{
							marginTop: 100,
							[mediaMin.medium]: {
								marginTop: 10,
							},
						}}
						wrap="no-wrap"
						alignItems="center"
					>
						{indexes.length <= 1 && <CloneApp />}
						<AddRowModal />
						<AddFieldModal />
					</Flex>
				)}
			</Skeleton>
		);
	}
}

const mapStateToProps = state => ({
	url: getUrl(state),
	isLoading: getIsLoading(state),
	mappings: getMappings(state),
	isDataLoading: dataSelectors.getIsLoading(state),
	indexes: getIndexes(state),
	types: getTypes(state),
	headers: getHeaders(state),
});

const mapDispatchToProps = {
	fetchMappings,
	updateReactiveList,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(DataBrowser);
