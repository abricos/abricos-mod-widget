<?php 
/**
 * Модуль Widget
 * 
 * @package Abricos 
 * @subpackage Widget
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

class WidgetModule extends Ab_Module {
	public function __construct(){
		// Версия модуля
		$this->version = "0.1.4-dev";
		
		// Название модуля
		$this->name = "widget";
	}
}

Abricos::ModuleRegister(new WidgetModule());

?>