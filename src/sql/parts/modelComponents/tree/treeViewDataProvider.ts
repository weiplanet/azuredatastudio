/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { ExtHostModelViewTreeViewsShape, SqlExtHostContext } from 'sql/workbench/api/node/sqlExtHost.protocol';
import { IExtHostContext } from 'vs/workbench/api/node/extHost.protocol';
import { IModelViewTreeViewDataProvider, ITreeComponentItem } from 'sql/workbench/common/views';
import { INotificationService } from 'vs/platform/notification/common/notification';
import * as vsTreeView from 'vs/workbench/api/electron-browser/mainThreadTreeViews';


export class TreeViewDataProvider extends vsTreeView.TreeViewDataProvider implements IModelViewTreeViewDataProvider {
	constructor(handle: number, treeViewId: string,
		context: IExtHostContext,
		notificationService?: INotificationService
	) {
		super(`${handle}-${treeViewId}`, context.getProxy(SqlExtHostContext.ExtHostModelViewTreeViews), notificationService);
	}

	onNodeCheckedChanged(treeViewId: string, treeItemHandle?: string, checked?: boolean) {
		(<ExtHostModelViewTreeViewsShape>this._proxy).$onNodeCheckedChanged(treeViewId, treeItemHandle, checked);
	}

	protected postGetChildren(elements: ITreeComponentItem[]): ITreeComponentItem[] {
		const result = [];
		if (elements) {
			for (const element of elements) {
				element.onCheckedChanged = (checked: boolean) => {
					this.onNodeCheckedChanged(this.treeViewId, element.handle, checked);
				};
				this.itemsMap.set(element.handle, element);
				result.push(element);
			}
		}
		return result;
	}
}
