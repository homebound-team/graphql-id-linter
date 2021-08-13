import {
  ASTVisitor,
  GraphQLError,
  GraphQLNamedType,
  GraphQLObjectType,
  isListType,
  isNonNullType,
  isObjectType,
  SelectionNode,
  SelectionSetNode,
  ValidationContext,
} from "graphql";

export function IdOnObjectSelectionSetRule(location: string | undefined) {
  return (context: ValidationContext): ASTVisitor => {
    return {
      SelectionSet(node: SelectionSetNode) {
        let type = context.getType();

        // Unwrap NonNull types
        if (isNonNullType(type)) {
          type = type.ofType;
        }

        // Unwrap Lists
        if (isListType(type)) {
          type = type.ofType;
          if (isNonNullType(type)) {
            type = type.ofType;
          }
        }

        // Ensure this is an object type (meaning it has fields)
        if (!isObjectType(type)) {
          return undefined;
        }

        const possibleFieldsIncludesId = "id" in type.getFields();
        if (possibleFieldsIncludesId && !selectionSetIncludes(node.selections, "id")) {
          context.reportError(
            new GraphQLError(
              `Missing "id" field in "${type.name}" in ${location}`,
              node,
              undefined,
              undefined,
              location ? [location] : undefined,
            ),
          );
        }

        // The enum detail pattern is specific pattern we use for enums, if we detect it,
        // we need the `code` to be there b/c it's used by the apollo type policy as the key.
        if (isEnumDetailObject(type) && !selectionSetIncludes(node.selections, "code")) {
          context.reportError(
            new GraphQLError(
              `Missing "code" field in "${type.name}" in ${location}`,
              node,
              undefined,
              undefined,
              location ? [location] : undefined,
            ),
          );
        }

        return undefined;
      },
    };
  };
}

/** Given a set of SelectionNodes from a SelectionSet, ensure "id" is included. */
function selectionSetIncludes(selectionNodes: readonly SelectionNode[], fieldName: string) {
  return selectionNodes.some((selectionNode) => {
    switch (selectionNode.kind) {
      case "Field":
        return selectionNode.name.value === fieldName;
      // Fragments have their own selection sets. If they do not include an "id",
      //   we will catch it when we visit those selection sets.
      case "FragmentSpread":
      case "InlineFragment":
        return true;
    }
  });
}

/**
 * Look for the FooDetail/code/name pattern of our enum detail objects.
 *
 * NOTE: Borrowed from graphql-typescript-factories. A helper library may be in order?
 */
function isEnumDetailObject(object: GraphQLNamedType): object is GraphQLObjectType {
  return (
    object instanceof GraphQLObjectType &&
    object.name.endsWith("Detail") &&
    Object.keys(object.getFields()).length >= 2 &&
    !!object.getFields()["code"] &&
    !!object.getFields()["name"]
  );
}
