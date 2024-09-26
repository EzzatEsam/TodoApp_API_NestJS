ALTER TABLE "todo_groups" DROP CONSTRAINT "todo_groups_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "todo_items" DROP CONSTRAINT "todo_items_group_id_todo_groups_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "todo_groups" ADD CONSTRAINT "todo_groups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "todo_items" ADD CONSTRAINT "todo_items_group_id_todo_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."todo_groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
