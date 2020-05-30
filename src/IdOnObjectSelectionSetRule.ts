import {
  ASTVisitor,
  GraphQLError,
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

        if (possibleFieldsIncludesId && !selectionSetIncludesId(node.selections)) {
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

        return undefined;
      },
    };
  };
}

/** Given a set of SelectionNodes from a SelectionSet, ensure "id" is included. */
function selectionSetIncludesId(selectionNodes: readonly SelectionNode[]) {
  return selectionNodes.some(selectionNode => {
    switch (selectionNode.kind) {
      case "Field":
        return selectionNode.name.value === "id";

      // Fragments have their own selection sets. If they do not include an "id",
      //   we will catch it when we visit those selection sets.
      case "FragmentSpread":
      case "InlineFragment":
        return true;
    }
  });
}
