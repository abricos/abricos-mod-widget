<?php 
/**
 * Модуль Widget
 * 
 * @version $Id: module.php 1030 2011-07-07 04:56:30Z roosit $
 * @package Abricos 
 * @subpackage Widget
 * @copyright Copyright (C) 2011 Abricos All rights reserved.
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin (roosit@abricos.org)
 */

class WidgetModule extends Ab_Module {
	public function __construct(){
		// Версия модуля
		$this->version = "0.1.1";
		
		// Название модуля
		$this->name = "widget";
	}
}

Abricos::ModuleRegister(new WidgetModule());

?>