import { PluginObj } from '@babel/core';
import * as types from '@babel/types';

export type BabelPlugin<S = {}> = (arg: {
  types: typeof types;
}) => PluginObj<S>;
