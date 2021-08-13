import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import { GraphQLError, validate } from "graphql";
import { IdOnObjectSelectionSetRule } from "./IdOnObjectSelectionSetRule";
import PluginOutput = Types.PluginOutput;

export const plugin: PluginFunction = async (schema, documents) => {
  const errors: GraphQLError[] = [];
  documents.forEach((d) => {
    const { document } = d;
    if (document) {
      errors.push(...validate(schema, document, [IdOnObjectSelectionSetRule(d.location)]));
    }
  });

  if (errors.length > 0) {
    throw errors[0];
  }

  return "" as PluginOutput;
};
