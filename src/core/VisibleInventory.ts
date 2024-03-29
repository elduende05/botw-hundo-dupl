import { DisplayableInventory, DisplayableSlot, itemStackToDisplayableSlot } from "./DisplayableInventory";
import { GameData } from "./GameData";
import { Item, ItemStack, itemToItemData, ItemType } from "./Item";
import { Slots } from "./Slots";

/*
 * Implementation of Visible Inventory (PauseMenuDataMgr) in botw
 */
export class VisibleInventory implements DisplayableInventory{
	private slots: Slots = new Slots([]);
	/* Implementation of mCount in botw */
	private count = 0;
	constructor(slots: Slots, count: number){
		this.slots = slots;
		this.count = count;
	}

	public deepClone(): VisibleInventory {
		return new VisibleInventory(this.slots.deepClone(), this.count);
	}

	public getDisplayedSlots(): DisplayableSlot[] {
		return this.slots.getSlotsRef().map((stack, i)=>itemStackToDisplayableSlot(stack, i>=this.count));
	}

	public getSlots(): Slots {
		return this.slots;
	}

	public addDirectly(stack: ItemStack){
		this.count+=this.slots.addStackDirectly(stack);
	}

	public addWhenReload(item: Item, count: number, equippedDuringReload: boolean) {
		const slotsAdded = this.slots.add(item, count, equippedDuringReload, true, this.count);
		this.count+=slotsAdded;
	}

	public addInGame(item: Item, count: number) {
		const slotsAdded = this.slots.add(item, count, false, false, this.count);
		this.count+=slotsAdded;
	}

	public remove(item: Item, count: number, slot: number) {
		const slotsRemoved = this.slots.remove(item, count, slot);
		this.count-=slotsRemoved;
	}

	public equip(item: Item, slot: number) {
		this.slots.equip(item, slot);
	}

	public unequip(item: Item, slot: number) {
		this.slots.unequip(item, slot);
	}

	// Only clears first this.count
	public clearForReload() {
		if(this.count > 0){
			this.slots.clearFirst(this.count);
			this.count = 0;
		}
	}

	public updateEquipmentDurability(gameData: GameData) {
		// find first weapon/bow/shield. this one searches entire inventory
		let foundWeapon = false;
		let foundBow = false;
		let foundShield = false;
		this.slots.getSlotsRef().forEach(({item, equipped}, i)=>{
			if(equipped){
				const type = itemToItemData(item).type;
				if(type === ItemType.Weapon && !foundWeapon){
					gameData.updateDurability(999, i);
					foundWeapon = true;
				}
				if(type === ItemType.Bow && !foundBow){
					gameData.updateDurability(999, i);
					foundBow = true;
				}
				if(type === ItemType.Shield && !foundShield){
					gameData.updateDurability(999, i);
					foundShield = true;
				}
			}
		});
	}

	public shootArrow(count: number, gameData: GameData) {
		const updatedSlot = this.slots.shootArrow(count);
		if(updatedSlot>=0){
			const durability = this.slots.getSlotsRef()[updatedSlot].count;
			gameData.updateDurability(durability, updatedSlot);
		}
	}

	public getCount(): number {
		return this.count;
	}

	public modifyCount(delta: number): void {
		this.count+=delta;
	}

	public resetCount(): void {
		this.count = this.slots.length;
	}

	public clearForEventide(): void {
		this.count-=this.slots.clearAllButKeyItems();
	}
}
