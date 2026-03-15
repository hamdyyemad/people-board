// Common constants for the core domain.
// The folder holds values: numbers 
// (e.g. MAX_LENGTH = 255) and message strings. 
// Those are constants.
// ------------------------------------------------------------------------------------------------
// The rules are the logic in value objects and entities 
// (e.g. validate() that uses those numbers and messages). 
// Naming the folder rules suggests the rules themselves live there, 
// but the rules live in the domain types; 
// this folder only holds the data they use.
// ------------------------------------------------------------------------------------------------
export {
  DEPARTMENT_NAME,
  DEPARTMENT_NAME_MESSAGES,
  DEPARTMENT_MESSAGES,
} from './department';
