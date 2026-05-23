/*
 Votilarus - Folder Widget Items Table
 Created for FolderWidget feature
*/

-- ----------------------------
-- Table structure for folder_widget_items
-- ----------------------------
DROP TABLE IF EXISTS "folder_widget_items";

CREATE TABLE "folder_widget_items" (
  "id" INTEGER NOT NULL,
  "folder_widget_id" INTEGER NOT NULL,
  "item_id" INTEGER NOT NULL,
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TEXT DEFAULT (datetime('now')),
  PRIMARY KEY ("id"),
  FOREIGN KEY ("folder_widget_id") REFERENCES "icon_widgets" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("item_id") REFERENCES "icon_items" ("id") ON DELETE CASCADE
);

-- Index for faster lookups by folder
CREATE INDEX IF NOT EXISTS "idx_folder_widget_items_folder" ON "folder_widget_items" ("folder_widget_id");

-- Index for faster lookups by item
CREATE INDEX IF NOT EXISTS "idx_folder_widget_items_item" ON "folder_widget_items" ("item_id");